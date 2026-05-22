import os
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from groq import Groq

router = APIRouter()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY and GROQ_API_KEY != "your_groq_api_key_here" else None

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    sessionId: str
    imageUrl: Optional[str] = None
    userProfile: Optional[Dict[str, Any]] = {}
    history: Optional[List[ChatMessage]] = []

def build_system_prompt(user_profile: dict) -> str:
    crops = ', '.join(user_profile.get('crops', ['various crops']))
    farm_details = user_profile.get('farmDetails', {})
    state = farm_details.get('state', 'India')
    soil = farm_details.get('soilType', 'Mixed')
    area = farm_details.get('farmArea', 'unknown')
    language = user_profile.get('language', 'English')
    name = user_profile.get('name', 'Farmer')

    return f"""You are Krishi AI, a highly specialized and personalized AI farming assistant for Indian farmers.

FARMER PROFILE:
- Name: {name}
- Location: {state}, India
- Crops: {crops}
- Farm Area: {area} acres
- Soil Type: {soil}
- Preferred Language: {language}

YOUR ROLE:
- Provide hyper-personalized farming advice based on this specific farmer's profile
- Answer questions about crop diseases, treatments, weather impact, market prices, and farming practices
- Give practical, actionable advice using locally available products and methods
- Use Indian agricultural context, local crop varieties, and regional farming practices
- Reference ICAR, state agricultural universities, and proven Indian farming methods
- Keep responses concise, practical, and easy to understand for farmers
- If the farmer asks in Hindi or regional language, respond in that language

IMPORTANT:
- Never give generic advice - always tailor it to this farmer's specific crops and location
- Include specific product names, dosages, and application methods when recommending treatments
- Consider current season and weather when giving advice
- Mention government schemes (PM-KISAN, crop insurance) when relevant"""

@router.post("")
async def chat(request: ChatRequest):
    system_prompt = build_system_prompt(request.userProfile)

    messages = [{"role": "system", "content": system_prompt}]

    # Add conversation history (last 8 messages)
    for msg in request.history[-8:]:
        messages.append({"role": msg.role, "content": msg.content})

    # Add current message
    messages.append({"role": "user", "content": request.message})

    if not client:
        # Mock response
        user_name = request.userProfile.get('name', 'Farmer')
        crops = request.userProfile.get('crops', ['crops'])
        crop_str = crops[0] if crops else 'your crop'
        msg = request.message.lower()

        if 'rain' in msg or 'weather' in msg:
            response_text = f"Namaste {user_name}! Based on weather data for your region, heavy rain is expected in 2 days. I recommend delaying pesticide applications, ensuring proper field drainage, and covering nursery beds. Your {crop_str} may need extra care during this period."
        elif 'sell' in msg or 'price' in msg or 'market' in msg:
            response_text = f"Hello {user_name}! Current market prices for {crop_str} are favorable. Based on market trends and demand patterns, this week would be a good time to sell. Check the Smart Sell feature in the Marketplace for detailed price predictions and best selling date recommendations."
        elif 'fertilizer' in msg or 'fertilise' in msg or 'nutrient' in msg:
            response_text = f"For your {crop_str} on {request.userProfile.get('farmDetails', {}).get('soilType', 'loam')} soil, I recommend a balanced NPK application. At this growth stage, apply 19:19:19 NPK at 2kg per acre. For better results, add micronutrient mixture once a fortnight."
        elif 'disease' in msg or 'pest' in msg or 'insect' in msg:
            response_text = f"I can help diagnose crop diseases! Use the Disease Detection feature on the Dashboard to upload an image of your affected {crop_str}. Our AI will analyze it and provide specific treatment recommendations for your region."
        else:
            response_text = f"Namaste {user_name}! I'm Krishi AI, your personal farming assistant. I can help you with crop diseases, weather advice, market prices, fertilizer recommendations, and more. What specific farming challenge can I help you with today? I'm specialized for {crop_str} cultivation in your region."

        return {"message": response_text, "sessionId": request.sessionId}

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.5,
            max_tokens=800,
        )
        return {
            "message": response.choices[0].message.content,
            "sessionId": request.sessionId
        }
    except Exception as e:
        print(f"Groq chat error: {e}")
        return {
            "message": f"I'm having trouble connecting to my knowledge base right now. Please try again in a moment. Meanwhile, I can tell you that for {request.userProfile.get('crops', ['your crops'])[0] if request.userProfile.get('crops') else 'your crops'}, regular monitoring and timely interventions are key to a good harvest.",
            "sessionId": request.sessionId
        }
