from dwg_to_dxf import convert_dwg_to_dxf

path = r"D:\CAd to BOQ\backend\uploads\DEANSGATE PHASE 2 - NORTH BLOCK ELECTRICAL LAYOUT - 22.07.25.dwg"

result = convert_dwg_to_dxf(path)

print("DXF created at:", result)
