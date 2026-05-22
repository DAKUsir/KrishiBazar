import os
import json
import random
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from groq import Groq

router = APIRouter()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = (
    Groq(api_key=GROQ_API_KEY)
    if GROQ_API_KEY and GROQ_API_KEY != "your_groq_api_key_here"
    else None
)

BASE_PRICES: Dict[str, float] = {
    "tomato": 25, "rice": 22, "wheat": 24, "onion": 30,
    "potato": 18, "cotton": 65, "maize": 20, "sugarcane": 3.2,
    "soybean": 45, "groundnut": 60, "mustard": 55, "sunflower": 50,
}

class SmartSellRequest(BaseModel):
    crop: str
    quantity: float
    farmDetails: Optional[Dict[str, Any]] = {}


def _mock_price_data(crop: str, quantity: float) -> dict:
    crop_lower  = crop.lower()
    base        = BASE_PRICES.get(crop_lower, 25)
    current     = round(base + random.uniform(-5, 10), 2)
    predicted   = round(current + random.uniform(-3, 8), 2)
    best_days   = random.randint(3, 14)
    best_date   = datetime.now() + timedelta(days=best_days)
    return {
        "currentPrice":    current,
        "predictedPrice":  predicted,
        "bestSellingDate": best_date.isoformat(),
        "best_days":       best_days,
    }


def _groq_market_analysis(crop: str, quantity: float, farm_details: dict, price_data: dict) -> dict:
    state = farm_details.get("state", "India")
    prompt = f"""You are an expert agricultural market analyst for Indian commodity markets.

A farmer wants to sell their crop and needs smart market advice:
- Crop: {crop}
- Quantity: {quantity} kg
- Location: {state}
- Current Market Price: ₹{price_data['currentPrice']}/kg
- Predicted Price (in {price_data['best_days']} days): ₹{price_data['predictedPrice']}/kg

Provide a detailed market analysis in JSON format with these exact keys:
{{
  "recommendation": "Sell Now or Wait",
  "reasoning": "Detailed explanation (2-3 sentences)",
  "marketInsights": ["insight1", "insight2", "insight3"],
  "riskFactors": ["risk1", "risk2"],
  "bestStrategy": "Specific selling strategy for this farmer",
  "priceDrivers": ["driver1", "driver2", "driver3"],
  "governmentSchemes": "Relevant MSP or government scheme info"
}}

Use Indian agricultural market context (APMC, MSP, e-NAM, mandi). Be specific."""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=1000,
        )
        content = response.choices[0].message.content
        start = content.find("{")
        end   = content.rfind("}") + 1
        if start != -1 and end != 0:
            return json.loads(content[start:end])
    except Exception as e:
        print(f"Groq market analysis error: {e}")

    return None


@router.post("/smart-sell")
async def smart_sell_analysis(request: SmartSellRequest):
    price_data = _mock_price_data(request.crop, request.quantity)
    current    = price_data["currentPrice"]
    predicted  = price_data["predictedPrice"]
    best_date  = price_data["bestSellingDate"]

    # Default values
    recommendation = "Wait" if predicted > current + 2 else "Sell Now"
    reasoning      = (
        f"{request.crop} prices are expected to "
        f"{'rise' if predicted > current else 'stabilize'} due to seasonal demand patterns. "
        f"Current supply from neighboring states is {'low' if predicted > current else 'normal'}."
    )
    market_insights  = []
    risk_factors     = []
    best_strategy    = ""
    price_drivers    = []
    govt_schemes     = ""

    # Enrich with Groq if available
    if groq_client:
        ai_result = _groq_market_analysis(
            request.crop, request.quantity, request.farmDetails, price_data
        )
        if ai_result:
            recommendation  = ai_result.get("recommendation", recommendation)
            reasoning       = ai_result.get("reasoning", reasoning)
            market_insights = ai_result.get("marketInsights", [])
            risk_factors    = ai_result.get("riskFactors", [])
            best_strategy   = ai_result.get("bestStrategy", "")
            price_drivers   = ai_result.get("priceDrivers", [])
            govt_schemes    = ai_result.get("governmentSchemes", "")

    return {
        "currentPrice":    current,
        "predictedPrice":  predicted,
        "currency":        "INR/kg",
        "bestSellingDate": best_date,
        "recommendation":  recommendation,
        "reasoning":       reasoning,
        "marketInsights":  market_insights,
        "riskFactors":     risk_factors,
        "bestStrategy":    best_strategy,
        "priceDrivers":    price_drivers,
        "governmentSchemes": govt_schemes,
        "expectedProfit":  round(request.quantity * predicted, 2),
        "marketDemand":    random.choice(["High", "Very High", "Medium"]),
        "priceChange7Days": round(((predicted - current) / current) * 100, 1),
        "nearbyMarkets": [
            {"name": "APMC Bengaluru",  "distance": "45 km",  "price": round(current + 2, 2)},
            {"name": "Local Mandi",     "distance": "8 km",   "price": round(current - 1, 2)},
            {"name": "e-NAM Platform",  "distance": "Digital", "price": round(current + 3, 2)},
        ],
    }
