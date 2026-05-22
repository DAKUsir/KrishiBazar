import os
import json
import base64
import io
from typing import Optional, Dict, Any, Tuple

from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from PIL import Image
from groq import Groq
from huggingface_hub import InferenceClient

router = APIRouter()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
HF_TOKEN     = os.getenv("HF_TOKEN")
HF_MODEL     = "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification"

groq_client = (
    Groq(api_key=GROQ_API_KEY)
    if GROQ_API_KEY and GROQ_API_KEY != "your_groq_api_key_here"
    else None
)

# ── HuggingFace InferenceClient (as per HF docs) ─────────────────────────────
hf_client = InferenceClient(
    provider="hf-inference",
    api_key=HF_TOKEN,
)


# ── Label parsing ─────────────────────────────────────────────────────────────
def _parse_label(label: str) -> Tuple[str, str]:
    """
    Model labels look like:
      'Corn (Maize) with Cercospora and Gray Leaf Spot'  -> crop, disease
      'Tomato Yellow Leaf Curl Virus'                    -> Tomato, Yellow Leaf Curl Virus
      'Tomato healthy'                                   -> Tomato, Healthy
    """
    if " with " in label:
        parts   = label.split(" with ", 1)
        crop    = parts[0].strip()
        disease = parts[1].strip()
    elif "healthy" in label.lower():
        crop    = label.lower().replace("healthy", "").strip().title()
        disease = "Healthy"
    else:
        words   = label.split()
        crop    = words[0].strip()
        disease = " ".join(words[1:]).strip() if len(words) > 1 else label
    return crop, disease


def _severity_from_label(label: str) -> str:
    lower = label.lower()
    if "healthy" in lower:
        return "Healthy"
    for kw in ("blight", "rot", "wilt", "mosaic", "virus", "canker", "smut"):
        if kw in lower:
            return "High"
    for kw in ("rust", "spot", "mildew", "scab", "scorch", "cercospora"):
        if kw in lower:
            return "Medium"
    return "Low"


# ── Detection ─────────────────────────────────────────────────────────────────
def run_detection(image_bytes: bytes) -> Tuple[str, str, float]:
    """
    Calls HuggingFace Inference API using InferenceClient.
    Returns (crop_name, disease_name, confidence_percent).
    """
    results = hf_client.image_classification(image_bytes, model=HF_MODEL)

    # Log all predictions exactly like the HF demo
    print("\n── Model predictions ──")
    for r in results:
        print(f"  {r.label:<55} {r.score:.3f}")
    print()

    top        = results[0]
    confidence = round(top.score * 100, 2)
    crop, disease = _parse_label(top.label)
    return crop, disease, confidence


# ── Groq analysis ─────────────────────────────────────────────────────────────
def generate_ai_analysis(crop: str, disease: str, confidence: float, context: dict) -> dict:
    if not groq_client:
        raise RuntimeError("GROQ_API_KEY not configured")

    is_healthy = disease.lower() == "healthy"

    if is_healthy:
        return {
            "explanation": f"The {crop} plant appears healthy with no visible disease symptoms.",
            "causes": [],
            "treatment": ["Continue current farming practices", "Monitor regularly for early signs"],
            "prevention": ["Maintain proper spacing", "Use balanced fertilizers", "Ensure good drainage"],
            "fertilizers": ["Continue balanced NPK schedule"],
            "pesticides": ["No pesticides needed currently"],
            "irrigation": "Maintain current irrigation schedule.",
            "riskAssessment": "Low risk. Plant appears healthy.",
            "yieldImpact": "No yield impact expected if current conditions are maintained.",
        }

    state = "India"
    fd = context.get("farmDetails")
    if isinstance(fd, dict):
        state = fd.get("state", "India")

    prompt = f"""You are an expert agricultural scientist for Indian farmers.

Plant disease detection result:
- Crop: {crop}
- Disease: {disease}
- Confidence: {confidence:.1f}%
- Location: {state}

Respond ONLY with valid JSON using these exact keys:
{{
  "explanation": "Clear 2-3 sentence explanation of the disease",
  "causes": ["cause1", "cause2", "cause3"],
  "treatment": ["step1", "step2", "step3", "step4"],
  "prevention": ["method1", "method2", "method3"],
  "fertilizers": ["fertilizer with dosage", "fertilizer2 with dosage"],
  "pesticides": ["pesticide with dosage", "pesticide2 with dosage"],
  "irrigation": "Specific irrigation advice",
  "riskAssessment": "Risk level and explanation",
  "yieldImpact": "Expected yield impact percentage and conditions"
}}

Use Indian agricultural context, real product names, specific dosages."""

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=1200,
    )
    content = response.choices[0].message.content
    start   = content.find("{")
    end     = content.rfind("}") + 1
    return json.loads(content[start:end])


# ── Request model ─────────────────────────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    image_path:   Optional[str] = None
    image_base64: Optional[str] = None
    context:      Optional[Dict[str, Any]] = {}


# ── Routes ────────────────────────────────────────────────────────────────────
@router.post("/analyze")
async def analyze_disease(request: AnalyzeRequest):
    image_bytes = None

    if request.image_base64:
        raw = request.image_base64
        if "," in raw:
            raw = raw.split(",", 1)[1]
        image_bytes = base64.b64decode(raw)

    if image_bytes is None and request.image_path:
        with open(request.image_path, "rb") as f:
            image_bytes = f.read()

    if image_bytes is None:
        return JSONResponse(status_code=400, content={"error": "No image provided"})

    try:
        crop_name, disease_name, confidence = run_detection(image_bytes)
    except Exception as e:
        return JSONResponse(status_code=502, content={"error": f"HuggingFace model error: {str(e)}"})

    crop_name = request.context.get("cropName") or crop_name
    severity  = _severity_from_label(disease_name)

    try:
        ai_analysis = generate_ai_analysis(crop_name, disease_name, confidence, request.context)
    except Exception as e:
        return JSONResponse(status_code=502, content={"error": f"Groq analysis error: {str(e)}"})

    return {
        "cropName":    crop_name,
        "diseaseName": disease_name,
        "confidence":  confidence,
        "severity":    severity,
        "aiAnalysis":  ai_analysis,
        "model":       HF_MODEL,
        "weatherAtTime": {"temperature": 28, "humidity": 72, "rainfall": 0},
    }


@router.post("/analyze-upload")
async def analyze_disease_upload(
    image: UploadFile = File(...),
    context: str = Form("{}"),
):
    try:
        ctx = json.loads(context)
    except Exception:
        ctx = {}

    image_bytes = await image.read()

    try:
        crop_name, disease_name, confidence = run_detection(image_bytes)
    except Exception as e:
        return JSONResponse(status_code=502, content={"error": f"HuggingFace model error: {str(e)}"})

    crop_name   = ctx.get("cropName") or crop_name
    severity    = _severity_from_label(disease_name)

    try:
        ai_analysis = generate_ai_analysis(crop_name, disease_name, confidence, ctx)
    except Exception as e:
        return JSONResponse(status_code=502, content={"error": f"Groq analysis error: {str(e)}"})

    return {
        "cropName":    crop_name,
        "diseaseName": disease_name,
        "confidence":  confidence,
        "severity":    severity,
        "aiAnalysis":  ai_analysis,
        "model":       HF_MODEL,
        "weatherAtTime": {"temperature": 28, "humidity": 72, "rainfall": 0},
    }
