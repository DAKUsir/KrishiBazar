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

# Copy the entire project
COPY . .

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
