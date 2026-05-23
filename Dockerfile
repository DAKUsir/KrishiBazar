FROM node:20-slim

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Create app directory
WORKDIR /app

# Copy package files and install all Node dependencies (root, frontend, backend)
COPY package.json ./
COPY frontend/package.json frontend/
COPY backend/package.json backend/
RUN npm run install:all
RUN cd backend && npm install @huggingface/inference

# Copy the entire project
COPY . .

# Accept VITE environment variables from Render dashboard during build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_SOCKET_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

# Build the frontend
RUN npm run build

# Install Python dependencies for AI Service
RUN pip3 install -r ai-service/requirements.txt --break-system-packages

# Make start script executable
RUN chmod +x start.sh

# Expose ports
EXPOSE 5000
EXPOSE 8000

# Start both services using shell script
CMD ["./start.sh"]
