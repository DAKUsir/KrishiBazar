# Render Deployment Guide

This guide covers the exact steps to deploy the entire Krishi Bazar platform (Frontend, Backend, and AI Service) on Render using the included `render.yaml` blueprint.

## 1. Connect to Render
1. Navigate to your [Render Dashboard](https://dashboard.render.com).
2. Click on the **Blueprints** tab located in the top navigation bar.
3. Click the **New Blueprint Instance** button.
4. If prompted, connect your GitHub account.
5. Select the `DAKUsir/KrishiBazar` repository from the list.

## 2. Supply Secure Environment Variables
Render will automatically read the `render.yaml` file and see that the project requires certain environment variables. Because we configured them to not sync directly in the code for security reasons, Render will pause and ask you to enter them securely in the dashboard:

You will need to copy the following values from your local `.env` file and paste them into the Render interface:
- **`MONGO_URI`**: Your MongoDB Atlas connection string.
- **`JWT_SECRET`**: Your secure secret key for user authentication.
- **`GOOGLE_CLIENT_ID`**: Google OAuth ID for login.
- **`GOOGLE_CLIENT_SECRET`**: Google OAuth Secret.
- **`HUGGINGFACE_API_KEY`**: Your Hugging Face access token.
- **`GROQ_API_KEY`**: Your Groq Llama3 access token.

## 3. Deploy and Monitor
1. Once your secrets are entered, click **Apply / Deploy Blueprint**.
2. Render will instantly begin provisioning three separate servers:
   - **`krishi-bazar-ai-service`**: Installs Python dependencies and boots the FastAPI server.
   - **`krishi-bazar-backend`**: Installs Node modules and boots the Express server (it will automatically be given the internal URL of the AI Service).
   - **`krishi-bazar-frontend`**: Builds the static React/Vite assets (it will automatically be given the secure public URL of the Backend API).
3. Wait for all three services to show a green "Live" status.

## 4. Access Your Live Site
Once the deployment finishes, click on the **`krishi-bazar-frontend`** service in your Render dashboard. You will see a public URL (e.g., `https://krishi-bazar-frontend-xxxx.onrender.com`). 

Click that link to use your live production application!
