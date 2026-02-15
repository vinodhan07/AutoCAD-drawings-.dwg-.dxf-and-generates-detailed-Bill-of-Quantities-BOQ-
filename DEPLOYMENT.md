# 🚀 Deployment Guide

This guide explains how to deploy the **CAD to BOQ Engine** to the cloud.

## 🏗️ Architecture
- **Backend**: Python FastAPI (Deploys to **Render** or **Heroku**)
- **Frontend**: React + Vite (Deploys to **Vercel** or **Netlify**)

---

## 1. 🐍 Backend Deployment (Render)

We will deploy the FastAPI backend to [Render.com](https://render.com) (Free Tier available).

### Steps:
1.  **Push your code to GitHub**.
2.  Go to **Render Dashboard** → **New +** → **Web Service**.
3.  Connect your GitHub repository.
4.  **Root Directory**: `backend`
5.  **Runtime**: `Python 3`
6.  **Build Command**: `pip install -r requirements.txt`
7.  **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
8.  **Environment Variables**:
    *   `GOOGLE_CLIENT_ID`: (Your Google Client ID)
    *   `PYTHON_VERSION`: `3.10.0`
9.  Click **Create Web Service**.
10. Once deployed, copy your backend URL (e.g., `https://cad-to-boq.onrender.com`).

---

## 2. ⚛️ Frontend Deployment (Vercel)

We will deploy the React frontend to [Vercel](https://vercel.com).

### Steps:
1.  Go to **Vercel Dashboard** → **Add New** → **Project**.
2.  Import your GitHub repository.
3.  **Root Directory**: Edit and select `frontend`.
4.  **Framework Preset**: Vite
5.  **Environment Variables**:
    *   `VITE_API_URL`: (Paste your Render Backend URL here, e.g., `https://cad-to-boq.onrender.com`)
    *   **Important**: Do NOT add a trailing slash `/` at the end of the URL.
6.  Click **Deploy**.

---

## 3. 🔐 Final Configuration

### Google OAuth Update
1.  Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  Select your project → **APIs & Services** → **Credentials**.
3.  Edit your **OAuth 2.0 Client ID**.
4.  Add your Vercel URL (e.g., `https://cad-to-boq.vercel.app`) to:
    *   **Authorized Javascript Origins**
    *   **Authorized Redirect URIs**
5.  Save changes.

### CORS Update (Optional)
If you encounter CORS issues, you may need to update `backend/main.py` restrict allowed origins to your specific Vercel domain instead of `["*"]`.

```python
origins = [
    "http://localhost:5173",
    "https://your-app.vercel.app"
]
```

---

## ✅ You're Live!
Your CAD to BOQ engine is now running in the cloud.
