# 🚀 Deployment Guide

This guide explains how to deploy the **CAD to BOQ Engine** to the cloud.

## 🏗️ Architecture
- **Backend**: Python FastAPI (Deploys to **Render** via Docker)
- **Frontend**: React + Vite (Deploys to **Vercel** or **Netlify**)

---

## 1. 🐍 Backend Deployment (Render)

Because **ODA File Converter** (required for `.dwg` support) is not standard on Linux servers, we must use **Docker**.

### Prerequisites
1.  **Download ODA File Converter for Linux**:
    - Go to [Open Design Alliance Download Page](https://www.opendesign.com/guestfiles/oda_file_converter) (Login may be required, or use guest link if available).
    - Download the **Linux DEB** version (e.g., `ODAFileConverter_25.2.0.0_Linux_3.10_11.deb`).
    - **Place this `.deb` file inside the `backend/` folder** of your project.

### Deployment Steps:
1.  **Commit & Push**: Ensure the `backend/Dockerfile` and your `.deb` file are committed to GitHub.
    *(Note: If the `.deb` file is large >100MB, you might need Git LFS, or just use the Dockerfile without it and accept that DWG upload will fail until you figure out a way to mount/install it. **Recommendation**: For free tier, just commit it if <100MB or use a direct download link in Dockerfile if you find one.)*
    
    *Alternative:* If you cannot commit the `.deb` file, you can edit the Dockerfile to use `wget` with a public link if you can find one.

2.  Go to **Render Dashboard** → **New +** → **Web Service**.
3.  Connect your GitHub repository.
4.  **Runtime**: Select **Docker** (NOT Python 3).
5.  **Root Directory**: `backend`
6.  **Environment Variables**:
    *   `GOOGLE_CLIENT_ID`: (Your Google Client ID)
    *   `PORT`: `8000`
7.  Click **Create Web Service**.

**Note**: If you skip the ODA installation, the app will still run, but uploading `.dwg` files will return an error nicely asking for `.dxf`.

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

---

## ✅ You're Live!
Your CAD to BOQ engine is now running in the cloud.
