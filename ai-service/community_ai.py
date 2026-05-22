import os
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from groq import Groq

router = APIRouter()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY and GROQ_API_KEY != "your_groq_api_key_here" else None

class GeneratePostRequest(BaseModel):
    scan: Optional[Dict[str, Any]] = {}
    user: Optional[Dict[str, Any]] = {}
    weather: Optional[Dict[str, Any]] = {}

@router.post("/generate-post")
async def generate_community_post(request: GeneratePostRequest):
    scan = request.scan or {}
    user = request.user or {}
    weather = request.weather or {}

    crop_name = scan.get('cropName', 'crop')
    disease_name = scan.get('diseaseName', 'disease')
    confidence = scan.get('confidence', 80)
    severity = scan.get('severity', 'Medium')
    state = user.get('farmDetails', {}).get('state', 'my region') if isinstance(user.get('farmDetails'), dict) else 'my region'
    district = user.get('farmDetails', {}).get('district', '') if isinstance(user.get('farmDetails'), dict) else ''

    if client:
        try:
            prompt = f"""Generate a farmer community post for:
Crop: {crop_name}
Disease: {disease_name}
Confidence: {confidence:.1f}%
Severity: {severity}
Location: {district}, {state}

Return JSON with: title, description (2-3 sentences, farmer-friendly), tags (array)"""

            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=400,
            )
            import json
            content = response.choices[0].message.content
            start = content.find('{')
            end = content.rfind('}') + 1
            if start != -1 and end != 0:
                result = json.loads(content[start:end])
                result.update({
                    "cropType": crop_name,
                    "disease": disease_name,
                    "state": state,
                    "district": district,
                    "language": user.get('language', 'English')
                })
                return result
        except Exception as e:
            print(f"Community AI error: {e}")

    # Mock response
    return {
        "title": f"{crop_name} leaves showing {disease_name} symptoms - Need expert advice",
        "description": f"My {crop_name} crop has been showing concerning symptoms. Our AI system detected {disease_name} with {confidence:.1f}% confidence at {severity.lower()} severity level. I'm located in {district + ', ' if district else ''}{state}. Has anyone in the community dealt with this before? What treatment worked best for you?",
        "cropType": crop_name,
        "disease": disease_name,
        "state": state,
        "district": district,
        "language": user.get('language', 'English'),
        "tags": [crop_name, disease_name, "disease", "help-needed", state, "farming"]
    }
