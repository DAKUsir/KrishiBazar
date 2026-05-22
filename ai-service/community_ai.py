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
    farmerNote: Optional[str] = ""

@router.post("/generate-post")
async def generate_community_post(request: GeneratePostRequest):
    scan = request.scan or {}
    user = request.user or {}
    weather = request.weather or {}
    farmer_note = request.farmerNote or ""

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
Farmer's Observations/Comment: "{farmer_note}"

Please write the post in a supportive, farmer-friendly community tone. Blend the AI diagnosis details (crop, disease, confidence, severity) and the farmer's personal observations naturally.
Return JSON with:
- "title": An engaging, descriptive forum title (e.g. "Early Blight spotted on my tomatoes in APMC - Need help!")
- "description": A detailed, friendly post description (3-4 sentences) outlining the problem, crop, AI diagnosis, farmer observations, and asking the community for advice or experiences.
- "tags": An array of 4-6 relevant tag strings (e.g. ["tomato", "early-blight", "disease", "help-needed"])"""

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
    desc = f"My {crop_name} crop is showing symptoms."
    if farmer_note:
        desc += f" Note: {farmer_note}."
    desc += f" Our AI system detected {disease_name} with {confidence:.1f}% confidence at {severity.lower()} severity level. I'm located in {district + ', ' if district else ''}{state}. Has anyone in the community dealt with this before? What treatment worked best for you?"

    return {
        "title": f"{crop_name} leaves showing {disease_name} symptoms - Need expert advice",
        "description": desc,
        "cropType": crop_name,
        "disease": disease_name,
        "state": state,
        "district": district,
        "language": user.get('language', 'English'),
        "tags": [crop_name, disease_name, "disease", "help-needed", state, "farming"]
    }
