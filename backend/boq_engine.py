"""
BOQ Engine — generates a Bill of Quantities with auto-estimated rates.

Takes the raw parsed CAD data and produces a multi-item BOQ
with quantities, rates from rate_database, and calculated totals.
Only items with quantity > 0 are included.
"""

from rate_database import RATE_TABLE


def generate_boq(raw: dict) -> list:
    """
    Generate a BOQ from parsed CAD data with auto-estimated rates.

    Args:
        raw: Dictionary from cad_parser.parse_dxf() containing extracted quantities.

    Returns:
        List of BOQ items, each with: item_no, component, description,
        quantity, unit, rate, total
    """

    # Map raw data keys to rate_database keys
    items_map = [
        ("wall_conduits",       raw.get("total_line_length", 0)),
        ("polyline_perimeter",  raw.get("polyline_total_length", 0)),
        ("floor_area",          raw.get("closed_polyline_area", 0)),
        ("circular_elements",   raw.get("circle_count", 0)),
        ("arc_elements",        raw.get("arc_total_length", 0)),
        ("doors",               raw.get("door_count", 0)),
        ("windows",             raw.get("window_count", 0)),
        ("columns",             raw.get("column_count", 0)),
        ("furniture",           raw.get("furniture_count", 0)),
    ]

    boq = []
    item_no = 1

    for key, quantity in items_map:
        # Skip items with zero quantity
        if not quantity or quantity <= 0:
            continue

        rate_info = RATE_TABLE.get(key)
        if not rate_info:
            continue

        rate = rate_info["rate"]
        quantity_rounded = round(quantity, 2)
        total = round(quantity_rounded * rate, 2)

        boq.append({
            "item_no": item_no,
            "component": rate_info["component"],
            "description": rate_info["description"],
            "quantity": quantity_rounded,
            "unit": rate_info["unit"],
            "rate": rate,
            "total": total,
        })

        item_no += 1

    return boq
