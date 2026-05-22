import os
import json
from fastapi import APIRouter
from typing import Optional
from groq import Groq

router = APIRouter()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = (
    Groq(api_key=GROQ_API_KEY)
    if GROQ_API_KEY and GROQ_API_KEY != "your_groq_api_key_here"
    else None
)

DEFAULT_PRODUCTS = [
    {
        "name": "Mancozeb 75% WP",
        "type": "Fungicide",
        "dosage": "2.5g per litre of water",
        "price": "₹180-220 per kg",
        "rating": 4.5,
        "usage": "Broad-spectrum contact fungicide"
    },
    {
        "name": "NPK 19:19:19",
        "type": "Fertilizer",
        "dosage": "5 kg per acre",
        "price": "₹1200-1500 per 50 kg",
        "rating": 4.7,
        "usage": "Balanced nutrition for overall plant health"
    },
    {
        "name": "Neem Oil 10000 PPM",
        "type": "Organic Pesticide",
        "dosage": "3 ml per litre of water",
        "price": "₹350-450 per litre",
        "rating": 4.3,
        "usage": "Broad spectrum organic pest and disease control"
    },
    {
        "name": "Propiconazole 25% EC",
        "type": "Systemic Fungicide",
        "dosage": "1 ml per litre of water",
        "price": "₹400-500 per litre",
        "rating": 4.6,
        "usage": "Systemic action against rust, blight, and leaf spot"
    },
    {
        "name": "Copper Oxychloride 50% WP",
        "type": "Preventive Fungicide",
        "dosage": "3g per litre of water",
        "price": "₹150-200 per kg",
        "rating": 4.2,
        "usage": "Preventive fungicide and bactericide"
    },
]


@router.get("/products")
async def get_product_recommendations(
    disease: Optional[str] = None,
    crop: Optional[str] = None,
):
    # Try Groq for AI-curated recommendations
    if groq_client and (disease or crop):
        prompt = f"""You are an Indian agricultural products expert.
A farmer needs product recommendations for:
- Crop: {crop or 'general crops'}
- Disease/Issue: {disease or 'general disease prevention'}

Provide the top 4 most relevant products available in India in this JSON format:
{{
  "products": [
    {{
      "name": "Product name",
      "type": "Fungicide/Pesticide/Fertilizer/etc",
      "dosage": "specific dosage instructions",
      "price": "₹XXX-XXX per unit",
      "rating": 4.5,
      "usage": "specific use case for this disease/crop"
    }}
  ],
  "applicationTips": "2-3 sentence expert tip on application timing and method",
  "reason": "Why these products were selected"
}}

Use real Indian product brands (Bayer, Syngenta, UPL, Coromandel, PI Industries, etc.).
Focus on products commonly available at Indian agri-input dealers."""

        try:
            response = groq_client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=800,
            )
            content = response.choices[0].message.content
            start = content.find("{")
            end = content.rfind("}") + 1
            if start != -1 and end != 0:
                result = json.loads(content[start:end])
                # ensure required fields exist
                result.setdefault("products", DEFAULT_PRODUCTS[:3])
                result.setdefault("reason", f"Recommended for {disease or 'general use'} in {crop or 'crops'}")
                return result
        except Exception as e:
            print(f"Groq recommendation error: {e}")

    # Fallback static recommendations
    return {
        "products": DEFAULT_PRODUCTS,
        "applicationTips": "Apply fungicides in the early morning or evening to avoid heat degradation. Ensure complete coverage of leaves including undersides.",
        "reason": f"Recommended based on {disease or 'general farming'} conditions for {crop or 'your crops'}",
    }
