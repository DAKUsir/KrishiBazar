# 🌱 Krishi Bazar — AI-Powered Smart Agriculture Platform

A production-ready full-stack MERN + FastAPI application for Indian farmers.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Python 3.10+
- npm

### 1. Install Dependencies

```bash
# Install root dependencies
cd /path/to/krishi-bazar
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Install AI service dependencies
cd ../ai-service
pip install -r requirements.txt
```

### 2. Configure Environment

Edit the `.env` file in the root directory:

```env
# Required - already filled:
GOOGLE_CLIENT_ID=1035716...
GOOGLE_CLIENT_SECRET=GOCSPX-...

# Required - fill these:
MONGODB_URI=mongodb://localhost:27017/krishibazar  # or your Atlas URI
JWT_SECRET=your_random_secret_here

# Optional (for full features):
GROQ_API_KEY=your_groq_api_key
OPENWEATHER_API_KEY=your_openweather_key
```

### 3. Seed Sample Data

```bash
# Seed marketplace products
cd backend && node scripts/seedProducts.js
```

### 4. Start Development

```bash
# From root directory — starts all 3 services
npm run dev

# Or start individually:
cd backend && npm run dev          # Port 5000
cd frontend && npm run dev         # Port 5173
cd ai-service && uvicorn main:app --reload --port 8000
```

### 5. Open Browser

Visit: **http://localhost:5173**

---

## 📁 Project Structure

```
krishi-bazar/
├── frontend/          # React + Vite + Tailwind + Shadcn
│   └── src/
│       ├── pages/     # 6 pages
│       ├── components/ # Layout, Sidebar, Navbar
│       ├── contexts/  # Auth context
│       └── lib/       # API client, utils
├── backend/           # Node.js + Express + MongoDB
│   ├── controllers/   # 6 controllers
│   ├── models/        # 7 Mongoose models
│   ├── routes/        # 6 route files
│   ├── services/      # AI + Weather services
│   ├── data/          # Crop seed data
│   ├── scripts/       # Seed scripts
│   └── uploads/       # Uploaded images
├── ai-service/        # FastAPI microservice
│   ├── disease_ai.py  # Disease detection + analysis
│   ├── chatbot_ai.py  # Groq/Llama3 chatbot
│   ├── community_ai.py # Post generation
│   └── marketplace_ai.py # Smart sell
├── .env               # Environment variables
└── package.json       # Root dev runner
```

---

## 🔑 API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/auth/google` | Start Google OAuth |
| GET | `/api/auth/google/callback` | OAuth callback |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/onboarding` | Complete onboarding |
| POST | `/api/disease/upload` | Upload crop image |
| POST | `/api/disease/analyze` | AI disease analysis |
| GET | `/api/weather` | Weather data |
| GET | `/api/crops` | Crop library |
| GET | `/api/community` | Community posts |
| POST | `/api/community/posts` | Create post |
| POST | `/api/community/create-ai-post` | AI-generate post |
| GET | `/api/market/products` | Buy products |
| GET | `/api/market/listings` | Yield listings |
| POST | `/api/market/sell-yield` | Create listing |
| POST | `/api/market/smart-sell` | Smart sell AI |
| POST | `/api/chat` | AI chat message |
| GET | `/api/chat/history` | Chat history |

---

## 🤖 AI Features

| Feature | Service | Status |
|---------|---------|--------|
| Disease Detection | FastAPI (mock → Plant.id) | ✅ Mock ready |
| Disease Analysis | Groq/Llama3 | ✅ Ready (needs API key) |
| Farming Chatbot | Groq/Llama3 | ✅ Ready (needs API key) |
| Community Post Gen | Groq/Llama3 | ✅ Ready |
| Smart Sell Analysis | FastAPI | ✅ Mock ready |
| Voice Input (STT) | Web Speech API | ✅ Browser-native |
| Text to Speech | Web Speech API | ✅ Browser-native |
| Weather | OpenWeatherMap | ✅ Mock ready |

---

## 🔧 Getting API Keys

1. **Groq API** (free): https://console.groq.com
2. **OpenWeather** (free tier): https://openweathermap.org/api
3. **Google OAuth**: Already configured ✅

---

## 📱 Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Marketing page |
| Auth | `/auth` | Google Sign-In |
| Onboarding | `/onboarding` | 4-step farm setup |
| Dashboard | `/dashboard` | Disease detection, weather, AI |
| Crop Library | `/crops` | Encyclopedia with 8+ crops |
| Community | `/community` | Posts, likes, comments |
| Marketplace | `/marketplace` | Buy products, sell yield |
| AI Assistant | `/assistant` | Chat, voice, TTS |
