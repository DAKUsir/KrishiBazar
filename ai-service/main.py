import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load env from root
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../.env'))

from disease_ai import router as disease_router
from chatbot_ai import router as chat_router
from recommendation_ai import router as recommendation_router
from community_ai import router as community_router
from marketplace_ai import router as marketplace_router

app = FastAPI(
    title="Krishi Bazar AI Service",
    description="AI microservice for Krishi Bazar agriculture platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(disease_router, prefix="/disease", tags=["Disease Detection"])
app.include_router(chat_router, prefix="/chat", tags=["AI Chatbot"])
app.include_router(recommendation_router, prefix="/recommendations", tags=["Recommendations"])
app.include_router(community_router, prefix="/community", tags=["Community"])
app.include_router(marketplace_router, prefix="/marketplace", tags=["Marketplace"])

@app.get("/")
def root():
    return {"service": "Krishi Bazar AI", "status": "running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}
