import subprocess
import os
import platform
import shutil

# Dynamic ODA Path Resolution
def get_oda_converter_path():
    # 1. Check system PATH (works for Linux/Mac if installed, and Windows if in PATH)
    path = shutil.which("ODAFileConverter")
    if path:
        return path
    
    # 2. Check common Windows default locations
    system = platform.system()
    if system == "Windows":
        # Known versions to check - add more if needed
        paths = [
            r"C:\Program Files\ODA\ODAFileConverter 26.12.0\ODAFileConverter.exe",
            r"C:\Program Files\ODA\ODAFileConverter 25.12.0\ODAFileConverter.exe",
            r"C:\Program Files\ODA\ODAFileConverter 25.0.0\ODAFileConverter.exe",
        ]
        for p in paths:
            if os.path.exists(p):
                return p
                
    return None

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "converted")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

def convert_dwg_to_dxf(dwg_path):
    oda_path = get_oda_converter_path()
    
    if not oda_path:
        # Fallback error if converter is missing
        raise FileNotFoundError(
            "ODAFileConverter not found. Please install ODA File Converter "
            "and ensure it is in your system PATH, or upload a DXF file directly."
        )

    cmd = [
        oda_path,
        os.path.dirname(dwg_path),  # Input Directory
        OUTPUT_DIR,                 # Output Directory
        "ACAD2018",                 # Version
        "DXF",                      # Output Format
        "0",                        # Recurse
        "1"                         # Audit
    ]
    
    # Run conversion
    try:
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"ODA Converter failed: {e.stderr.decode() if e.stderr else 'Unknown error'}")

    filename = os.path.basename(dwg_path).replace(".dwg", ".dxf")
    dxf_path = os.path.join(OUTPUT_DIR, filename)
    
    if not os.path.exists(dxf_path):
        raise FileNotFoundError(f"Conversion failed: output file {dxf_path} not created.")

    return dxf_path
