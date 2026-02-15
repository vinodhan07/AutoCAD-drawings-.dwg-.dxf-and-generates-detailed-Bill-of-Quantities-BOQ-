"""
Standard construction rate database.
Rates are approximate defaults based on DSR 2024 / Indian market averages.
Users can override these in the frontend — they serve as sensible starting points.
"""

# Each entry: component_key -> { unit, rate (INR), description }
RATE_TABLE = {
    "wall_conduits": {
        "component": "Wall Conduits / Linear Runs",
        "description": "Electrical conduit runs extracted from CAD line entities",
        "unit": "m",
        "rate": 250,
    },
    "wiring_runs": {
        "component": "Wiring Runs",
        "description": "Internal wiring runs (1.5 sq mm copper, PVC insulated)",
        "unit": "m",
        "rate": 120,
    },
    "doors": {
        "component": "Doors",
        "description": "Standard flush doors identified from CAD block references",
        "unit": "nos",
        "rate": 8500,
    },
    "windows": {
        "component": "Windows",
        "description": "Standard aluminium sliding windows from CAD block references",
        "unit": "nos",
        "rate": 6000,
    },
    "floor_area": {
        "component": "Floor / Slab Area",
        "description": "RCC slab work area calculated from closed polyline regions",
        "unit": "m²",
        "rate": 3200,
    },
    "ceiling_runs": {
        "component": "Ceiling Framework",
        "description": "False ceiling framing runs from CAD linear entities",
        "unit": "m",
        "rate": 180,
    },
    "circular_elements": {
        "component": "Circular Fittings",
        "description": "Circular elements (columns, pillars, round fittings) from CAD circles",
        "unit": "nos",
        "rate": 1500,
    },
    "arc_elements": {
        "component": "Curved Sections",
        "description": "Curved/arc sections measured from CAD arc entities",
        "unit": "m",
        "rate": 350,
    },
    "polyline_perimeter": {
        "component": "Perimeter Measurements",
        "description": "Boundary perimeters calculated from CAD polyline entities",
        "unit": "m",
        "rate": 200,
    },
    "columns": {
        "component": "Columns",
        "description": "Structural columns identified from CAD block references",
        "unit": "nos",
        "rate": 12000,
    },
    "furniture": {
        "component": "Furniture Items",
        "description": "Furniture blocks identified from CAD block references",
        "unit": "nos",
        "rate": 5000,
    },
}


def get_rate(component_key: str) -> dict:
    """Get rate info for a component key. Returns empty dict if not found."""
    return RATE_TABLE.get(component_key, {})


def get_all_rates() -> dict:
    """Return the full rate table."""
    return RATE_TABLE
