import os
import random
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/products")
async def get_product_recommendations(disease: Optional[str] = None, crop: Optional[str] = None):
    recommendations = {
        "products": [
            {
                "name": "Mancozeb 75% WP",
                "type": "Fungicide",
                "usage": f"Best for {disease or 'fungal diseases'} in {crop or 'most crops'}",
                "dosage": "2.5g per liter of water",
                "price": "₹180-220 per kg",
                "rating": 4.5
            },
            {
                "name": f"NPK 19:19:19",
                "type": "Fertilizer",
                "usage": "Balanced nutrition for overall plant health",
                "dosage": "5kg per acre",
                "price": "₹1200-1500 per 50kg",
                "rating": 4.7
            },
            {
                "name": "Neem Oil 10000 PPM",
                "type": "Organic Pesticide",
                "usage": "Broad spectrum pest and disease control",
                "dosage": "3ml per liter of water",
                "price": "₹350-450 per liter",
                "rating": 4.3
            }
        ],
        "reason": f"Recommended based on {disease or 'general farming'} conditions for {crop or 'your crops'}"
    }
    return recommendations
