import os
import random
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from groq import Groq

router = APIRouter()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY and GROQ_API_KEY != "your_groq_api_key_here" else None

MOCK_DISEASES = [
    {
        "cropName": "Tomato",
        "diseaseName": "Early Blight",
        "confidence": 89.3,
        "severity": "Medium",
        "description": "Alternaria solani fungal infection"
    },
    {
        "cropName": "Rice",
        "diseaseName": "Blast Disease",
        "confidence": 92.1,
        "severity": "High",
        "description": "Magnaporthe oryzae fungal infection"
    },
    {
        "cropName": "Wheat",
        "diseaseName": "Yellow Rust",
        "confidence": 85.7,
        "severity": "Medium",
        "description": "Puccinia striiformis fungal infection"
    },
    {
        "cropName": "Cotton",
        "diseaseName": "Bacterial Blight",
        "confidence": 78.4,
        "severity": "Low",
        "description": "Xanthomonas citri bacterial infection"
    },
]

class AnalyzeRequest(BaseModel):
    image_path: str
    context: Optional[Dict[str, Any]] = {}

def generate_ai_analysis_with_groq(crop_name: str, disease_name: str, confidence: float, context: dict) -> dict:
    if not client:
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
        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=1500,
        )
        import json
        content = response.choices[0].message.content
        # Extract JSON from response
        start = content.find('{')
        end = content.rfind('}') + 1
        if start != -1 and end != 0:
            return json.loads(content[start:end])
    except Exception as e:
        print(f"Groq API error: {e}")

    return generate_mock_analysis(crop_name, disease_name)

def generate_mock_analysis(crop_name: str, disease_name: str) -> dict:
    return {
        "explanation": f"{disease_name} is a common disease affecting {crop_name} crops. It is caused by fungal or bacterial pathogens that thrive in specific weather conditions. Early detection is crucial to prevent spread.",
        "causes": [
            "High humidity levels (above 80%)",
            "Warm temperatures creating ideal fungal growth conditions",
            "Poor air circulation between plants",
            "Excessive nitrogen fertilization weakening plant resistance",
            "Infected seeds or plant debris from previous season"
        ],
        "treatment": [
            f"Apply Mancozeb 75% WP at 2.5g per liter of water as foliar spray",
            "Remove and destroy all infected plant parts immediately",
            "Apply Propiconazole 25% EC at 1ml per liter water for systemic action",
            "Repeat spray every 7-10 days until disease is controlled",
            "Ensure proper spacing between plants for better air circulation"
        ],
        "prevention": [
            "Practice crop rotation every 2-3 seasons",
            "Use certified disease-free seeds from reliable sources",
            "Avoid overhead irrigation - use drip irrigation instead",
            "Apply preventive copper-based fungicide at start of season",
            "Maintain field hygiene by removing crop debris after harvest"
        ],
        "fertilizers": [
            "Balanced NPK (19:19:19) to strengthen overall plant health",
            "Potassium-rich fertilizer (MOP) to improve disease resistance",
            "Avoid excess nitrogen which promotes soft tissue susceptible to disease"
        ],
        "pesticides": [
            "Mancozeb 75% WP - contact fungicide",
            "Propiconazole 25% EC - systemic fungicide",
            "Copper Oxychloride 50% WP - preventive treatment",
            "Carbendazim 50% WP - systemic action"
        ],
        "irrigation": "Switch to drip irrigation to keep foliage dry. Water plants at the base in early morning hours (6-8 AM) to allow soil surface to dry during the day. Avoid waterlogging.",
        "riskAssessment": f"Medium-High risk level. Without treatment, {disease_name} can spread to 60-80% of the crop within 2-3 weeks under current weather conditions. Immediate action is strongly recommended.",
        "yieldImpact": f"Estimated 25-40% yield reduction if left untreated for 2 weeks. With timely treatment, yield loss can be limited to 5-10%. Economic threshold: act before disease covers more than 5% of leaf area."
    }

@router.post("/analyze")
async def analyze_disease(request: AnalyzeRequest):
    # Mock detection (replace with real model API)
    detected = random.choice(MOCK_DISEASES)

    crop_name = request.context.get("cropName") or detected["cropName"]
    disease_name = detected["diseaseName"]
    confidence = detected["confidence"]
    severity = detected["severity"]

    # Generate AI analysis
    ai_analysis = generate_ai_analysis_with_groq(crop_name, disease_name, confidence, request.context)

    return {
        "cropName": crop_name,
        "diseaseName": disease_name,
        "confidence": confidence,
        "severity": severity,
        "aiAnalysis": ai_analysis,
        "weatherAtTime": {
            "temperature": 28,
            "humidity": 72,
            "rainfall": 0
        }
    }
