import os
import random
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

router = APIRouter()

class SmartSellRequest(BaseModel):
    crop: str
    quantity: float
    farmDetails: Optional[Dict[str, Any]] = {}

@router.post("/smart-sell")
async def smart_sell_analysis(request: SmartSellRequest):
    base_prices = {
        "tomato": 25, "rice": 22, "wheat": 24, "onion": 30,
        "potato": 18, "cotton": 65, "maize": 20, "sugarcane": 3.2
    }
    crop_lower = request.crop.lower()
    base = base_prices.get(crop_lower, 25)
    fluctuation = random.uniform(-5, 10)
    current_price = round(base + fluctuation, 2)
    predicted_price = round(current_price + random.uniform(-3, 8), 2)
    best_days = random.randint(3, 14)
    best_date = datetime.now() + timedelta(days=best_days)

    return {
        "currentPrice": current_price,
        "predictedPrice": predicted_price,
        "currency": "INR/kg",
        "bestSellingDate": best_date.isoformat(),
        "recommendation": "Wait" if predicted_price > current_price + 2 else "Sell Now",
        "reasoning": f"{request.crop} prices are expected to {'rise' if predicted_price > current_price else 'stabilize'} due to seasonal demand patterns. Current supply from neighboring states is {'low' if predicted_price > current_price else 'normal'}.",
        "expectedProfit": round(request.quantity * predicted_price, 2),
        "marketDemand": random.choice(["High", "Very High", "Medium"]),
        "priceChange7Days": round(((predicted_price - current_price) / current_price) * 100, 1),
        "nearbyMarkets": [
            {"name": "APMC Bengaluru", "distance": "45 km", "price": round(current_price + 2, 2)},
            {"name": "Local Mandi", "distance": "8 km", "price": round(current_price - 1, 2)},
            {"name": "Online Platform", "distance": "Digital", "price": round(current_price + 3, 2)},
        ]
    }
