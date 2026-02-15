from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import shutil, os, sys
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

# Add root directory to sys.path to import dwg_to_dxf
root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(root_path)

# Add current directory to sys.path to ensure local imports work if needed
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from dwg_to_dxf import convert_dwg_to_dxf
except ImportError:
    # Fallback if dwg_to_dxf is in the same directory
    from .dwg_to_dxf import convert_dwg_to_dxf

from cad_parser import parse_dxf
from boq_engine import generate_boq
from email_service import send_boq_email

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/process")
async def process(
    file: UploadFile,
    access_token: Optional[str] = Form(None),
    user_email: Optional[str] = Form(None),
):

    dwg_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(dwg_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Convert DWG -> DXF automatically
    dxf_path = convert_dwg_to_dxf(dwg_path)

    # Parse DXF — now returns a rich dictionary of extracted data
    raw_data = parse_dxf(dxf_path)

    # Generate BOQ with auto-estimated rates
    boq = generate_boq(raw_data)

    # Send email if user is authenticated
    email_status = None
    if access_token and user_email:
        email_status = send_boq_email(access_token, user_email, boq)

    return {
        "boq": boq,
        "email_status": email_status,
    }
