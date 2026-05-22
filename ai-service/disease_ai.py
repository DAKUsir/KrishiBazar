import os
import json
import base64
from io import BytesIO
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
from groq import Groq
from huggingface_hub import InferenceClient
from PIL import Image

router = APIRouter()

# ── Clients ──────────────────────────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
HF_TOKEN     = os.getenv("HF_TOKEN")

groq_client = (
    Groq(api_key=GROQ_API_KEY)
    if GROQ_API_KEY and GROQ_API_KEY != "your_groq_api_key_here"
    else None
)

hf_client = (
    InferenceClient(token=HF_TOKEN)
    if HF_TOKEN
    else None
)

HF_MODEL = "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification"

# ── Severity mapping ──────────────────────────────────────────────────────────
SEVERITY_MAP = {
    "blight":       "High",
    "rust":         "Medium",
    "spot":         "Medium",
    "mildew":       "Medium",
    "mosaic":       "High",
    "rot":          "High",
    "wilt":         "High",
    "scab":         "Medium",
    "canker":       "High",
    "healthy":      "None",
    "leaf_curl":    "Low",
    "yellow":       "Low",
}

def _severity_from_label(label: str) -> str:
    label_lower = label.lower()
    for key, severity in SEVERITY_MAP.items():
        if key in label_lower:
            return severity
    return "Medium"

def _parse_hf_label(label: str) -> tuple[str, str]:
    """
    HF model labels look like: 'Tomato___Early_blight' or 'Apple___healthy'
    Returns (crop_name, disease_name).
    """
    label = label.replace("___", "___")          # normalise
    parts = label.split("___")
    if len(parts) == 2:
        crop    = parts[0].replace("_", " ").strip().title()
        disease = parts[1].replace("_", " ").strip().title()
    else:
        crop    = "Unknown Crop"
        disease = label.replace("_", " ").strip().title()
    return crop, disease

# ── Groq analysis ─────────────────────────────────────────────────────────────
def generate_ai_analysis_with_groq(
    crop_name: str, disease_name: str, confidence: float, context: dict
) -> dict:
    if not groq_client:
        return generate_mock_analysis(crop_name, disease_name)

    prompt = f"""You are an expert agricultural scientist and crop disease specialist.

A farmer has uploaded an image and the disease detection model has identified:
- Crop: {crop_name}
- Disease: {disease_name}
- Confidence: {confidence:.1f}%
- Farmer Location: {context.get('farmDetails', {}).get('state', 'India')}
- Soil Type: {context.get('farmDetails', {}).get('soilType', 'Loam')}

Provide a comprehensive analysis in JSON format with these exact keys:
{{
  "explanation": "Clear explanation of the disease",
  "causes": ["cause1", "cause2", "cause3"],
  "treatment": ["step1", "step2", "step3"],
  "prevention": ["method1", "method2", "method3"],
  "fertilizers": ["fertilizer1", "fertilizer2"],
  "pesticides": ["pesticide1", "pesticide2"],
  "irrigation": "Specific irrigation advice",
  "riskAssessment": "Risk level and explanation",
  "yieldImpact": "Expected yield impact percentage and conditions"
}}

Be specific, practical, and farmer-friendly. Use Indian agricultural context."""

    try:
        response = groq_client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=1500,
        )
        content = response.choices[0].message.content
        start = content.find("{")
        end   = content.rfind("}") + 1
        if start != -1 and end != 0:
            return json.loads(content[start:end])
    except Exception as e:
        print(f"Groq API error: {e}")

    return generate_mock_analysis(crop_name, disease_name)


def generate_mock_analysis(crop_name: str, disease_name: str) -> dict:
    return {
        "explanation": (
            f"{disease_name} is a common disease affecting {crop_name} crops. "
            "It is caused by fungal or bacterial pathogens that thrive in specific "
            "weather conditions. Early detection is crucial to prevent spread."
        ),
        "causes": [
            "High humidity levels (above 80%)",
            "Warm temperatures creating ideal fungal growth conditions",
            "Poor air circulation between plants",
            "Excessive nitrogen fertilization weakening plant resistance",
            "Infected seeds or plant debris from previous season",
        ],
        "treatment": [
            "Apply Mancozeb 75% WP at 2.5 g per litre of water as foliar spray",
            "Remove and destroy all infected plant parts immediately",
            "Apply Propiconazole 25% EC at 1 ml per litre water for systemic action",
            "Repeat spray every 7-10 days until disease is controlled",
            "Ensure proper spacing between plants for better air circulation",
        ],
        "prevention": [
            "Practice crop rotation every 2-3 seasons",
            "Use certified disease-free seeds from reliable sources",
            "Avoid overhead irrigation - use drip irrigation instead",
            "Apply preventive copper-based fungicide at start of season",
            "Maintain field hygiene by removing crop debris after harvest",
        ],
        "fertilizers": [
            "Balanced NPK (19:19:19) to strengthen overall plant health",
            "Potassium-rich fertilizer (MOP) to improve disease resistance",
        ],
        "pesticides": [
            "Mancozeb 75% WP - contact fungicide",
            "Propiconazole 25% EC - systemic fungicide",
            "Copper Oxychloride 50% WP - preventive treatment",
            "Carbendazim 50% WP - systemic action",
        ],
        "irrigation": (
            "Switch to drip irrigation to keep foliage dry. Water plants at the base "
            "in early morning hours (6-8 AM). Avoid waterlogging."
        ),
        "riskAssessment": (
            f"Medium-High risk. Without treatment, {disease_name} can spread to "
            "60-80% of the crop within 2-3 weeks under current weather conditions."
        ),
        "yieldImpact": (
            "Estimated 25-40% yield reduction if left untreated for 2 weeks. "
            "With timely treatment, yield loss can be limited to 5-10%."
        ),
    }


# ── HuggingFace disease detection ────────────────────────────────────────────
def run_hf_detection(image_bytes: bytes) -> tuple[str, str, float]:
    """
    Calls HF InferenceClient for image classification.
    Returns (crop_name, disease_name, confidence_percent).
    Falls back to a generic result if the call fails.
    """
    if not hf_client:
        return "Tomato", "Early Blight", 82.0

    try:
        results = hf_client.image_classification(image_bytes, model=HF_MODEL)
        # results is a list of ClassificationOutput sorted by score descending
        top = results[0]
        label      = top.label
        confidence = round(top.score * 100, 2)
        crop, disease = _parse_hf_label(label)
        return crop, disease, confidence
    except Exception as e:
        print(f"HuggingFace inference error: {e}")
        return "Tomato", "Early Blight", 82.0


# ── Request model (JSON path fallback) ───────────────────────────────────────
class AnalyzeRequest(BaseModel):
    image_path: Optional[str]   = None
    image_base64: Optional[str] = None
    context: Optional[Dict[str, Any]] = {}


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/analyze")
async def analyze_disease(request: AnalyzeRequest):
    """
    Accepts either:
      - image_path  (absolute server-side path to the saved upload)
      - image_base64 (data-URI or raw base64 string from the frontend)
    """
    image_bytes: Optional[bytes] = None

    # 1. Load image bytes from base64 payload
    if request.image_base64:
        raw = request.image_base64
        if "," in raw:
            raw = raw.split(",", 1)[1]
        try:
            image_bytes = base64.b64decode(raw)
        except Exception as e:
            print(f"Base64 decode error: {e}")

    # 2. Load image bytes from server-side file path
    if image_bytes is None and request.image_path:
        try:
            with open(request.image_path, "rb") as f:
                image_bytes = f.read()
        except Exception as e:
            print(f"File read error: {e}")

    if image_bytes is None:
        return JSONResponse(status_code=400, content={"error": "No valid image provided"})

    # ── Run HuggingFace model ──
    crop_name, disease_name, confidence = run_hf_detection(image_bytes)

    # If caller supplied crop name, respect it
    crop_name = request.context.get("cropName") or crop_name

    severity  = _severity_from_label(disease_name)

    # ── Generate detailed AI analysis via Groq ──
    ai_analysis = generate_ai_analysis_with_groq(
        crop_name, disease_name, confidence, request.context
    )

    return {
        "cropName":    crop_name,
        "diseaseName": disease_name,
        "confidence":  confidence,
        "severity":    severity,
        "aiAnalysis":  ai_analysis,
        "model":       HF_MODEL,
        "weatherAtTime": {
            "temperature": 28,
            "humidity":    72,
            "rainfall":    0,
        },
    }


@router.post("/analyze-upload")
async def analyze_disease_upload(
    image: UploadFile = File(...),
    context: str      = Form("{}"),
):
    """
    Multipart endpoint - accepts raw file upload directly from the frontend.
    """
    try:
        ctx = json.loads(context)
    except Exception:
        ctx = {}

    image_bytes = await image.read()

    crop_name, disease_name, confidence = run_hf_detection(image_bytes)
    crop_name = ctx.get("cropName") or crop_name
    severity  = _severity_from_label(disease_name)
    ai_analysis = generate_ai_analysis_with_groq(crop_name, disease_name, confidence, ctx)

    return {
        "cropName":    crop_name,
        "diseaseName": disease_name,
        "confidence":  confidence,
        "severity":    severity,
        "aiAnalysis":  ai_analysis,
        "model":       HF_MODEL,
        "weatherAtTime": {"temperature": 28, "humidity": 72, "rainfall": 0},
    }
