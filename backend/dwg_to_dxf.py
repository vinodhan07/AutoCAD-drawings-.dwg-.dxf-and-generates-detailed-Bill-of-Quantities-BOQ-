import subprocess
import os

ODA_PATH = r"C:\Program Files\ODA\ODAFileConverter 26.12.0\ODAFileConverter.exe"

UPLOAD_DIR = r"D:\CAd to BOQ\backend\uploads"
OUTPUT_DIR = r"D:\CAd to BOQ\backend\converted"

os.makedirs(OUTPUT_DIR, exist_ok=True)

def convert_dwg_to_dxf(dwg_path):

    cmd = [
        ODA_PATH,
        UPLOAD_DIR,
        OUTPUT_DIR,
        "ACAD2018",
        "DXF",
        "0",
        "1"
    ]

    subprocess.run(cmd, check=True)

    filename = os.path.basename(dwg_path).replace(".dwg", ".dxf")

    return os.path.join(OUTPUT_DIR, filename)
