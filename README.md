<div align="center">

# 🏗️ CAD to BOQ Engine

**Automated Bill of Quantities (BOQ) Generator from AutoCAD Drawings**

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-61DAFB?logo=react)](https://reactjs.org/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python)](https://www.python.org/)

<p align="center">
  <a href="#-about-the-project">About The Project</a> •
  <a href="#-key-features">Key Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-usage">Usage</a>
</p>

</div>

---

## 📖 About The Project

**CAD to BOQ Engine** is a powerful full-stack web application designed to streamline the construction estimation process. It automatically parses AutoCAD drawings (`.dwg`/`.dxf`), extracts geometric data (lengths, areas, counts), and generates detailed **Bill of Quantities (BOQ)** reports with real-time cost estimation based on DSR 2024 standards.

Securely integrated with **Google OAuth 2.0**, it ensures that only authorized users can upload files, and it delivers professional HTML reports directly to stakeholders' emails.

---

## 🚀 Key Features

- **🎨 Automated Extraction**: Intelligent parsing of CAD entities (Lines, Polylines, Circles, Arcs, Blocks) to calculate quantities.
- **💰 Smart Cost Estimation**: Auto-assignment of unit rates for Walls, Slabs, Flooring, and more based on predefined databases.
- **📊 Professional Reports**: Generates detailed BOQ tables with Grand Totals and supports Excel export.
- **🔐 Secure Access**: Gatekept by Google OAuth 2.0 for secure, authorized usage.
- **📧 Automated Email Delivery**: Sends beautifully formatted BOQ reports via Gmail API directly to your inbox.
- **✨ Modern UI/UX**: "Soft/Pastel" aesthetic with glassmorphism, responsive design, and smooth animations.

---

## 🛠️ Tech Stack

### Frontend
| Component | Technology |
|-----------|------------|
| **Framework** | React 18 + Vite |
| **Styling** | Tailwind CSS + Custom CSS |
| **Auth** | `@react-oauth/google` |
| **State/HTTP** | Axios, React Hooks |

### Backend
| Component | Technology |
|-----------|------------|
| **API** | FastAPI (Python) |
| **CAD Parsing** | `ezdxf` |
| **Email Service** | Google Gmail API |
| **Server** | Uvicorn |

---

## 📂 Project Structure

```bash
d:\CAd to BOQ\
├── 📂 backend/
│   ├── main.py             # FastAPI entry point & core logic
│   ├── cad_parser.py       # CAD entity extraction engine
│   ├── boq_engine.py       # Rate assignment & cost calculation
│   ├── email_service.py    # Gmail API email sender
│   ├── rate_database.py    # Unit rates (DSR 2024)
│   └── .env                # Environment variables
└── 📂 frontend/
    ├── src/
    │   ├── App.tsx         # Main Application Component
    │   ├── main.tsx        # Entry point & Auth Provider
    │   └── index.css       # Global Styles & Theme
    └── package.json        # Dependencies
```

---

## ⚡ Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- **Node.js** (v16+) & **npm**
- **Python** (v3.10+)
- **Google Cloud Console Project** (for Gmail API & OAuth)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn ezdxf python-multipart python-dotenv google-auth google-api-python-client google-auth-oauthlib google-auth-httplib2
```

Create a `.env` file in the `backend` directory:
```env
GOOGLE_CLIENT_ID=your_google_client_id_here
```

Run the server:
```bash
uvicorn main:app --reload
```
_The API will start at `http://localhost:8000`._

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```
_The Application will be live at `http://localhost:5173`._

---

## 🔐 Google OAuth Configuration

To enable Login and Email features:
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new Project and enable the **Gmail API**.
3. Create **OAuth 2.0 Client IDs**.
4. Add `http://localhost:5173` to **Authorized Javascript Origins**.
5. Add `http://localhost:5173` to **Authorized Redirect URIs**.
6. Copy the `Client ID` to your backend `.env` and frontend `main.tsx`.

---

## 📝 Usage

1. **Sign In**: Click "Sign in with Google" in the top header.
2. **Upload**: Drag & drop your `.dwg` or `.dxf` file into the drop zone.
3. **Generate**: The engine processes the file and displays the BOQ table with live cost estimates.
4. **Email**: Check your Gmail inbox for the automated report.
5. **Export**: Click "Export to Excel" to download the report.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---
