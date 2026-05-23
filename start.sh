#!/bin/bash

echo "Starting Krishi Bazar AI Service (FastAPI) on port 8000..."
cd ai-service
uvicorn main:app --host 0.0.0.0 --port 8000 &
cd ..

echo "Starting Krishi Bazar Backend (Node.js) on port $PORT..."
cd backend
npm start
