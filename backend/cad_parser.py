import ezdxf
import math

# Common block name patterns for identification
DOOR_PATTERNS = ["door", "dr", "d-", "entrance", "gate"]
WINDOW_PATTERNS = ["window", "win", "w-", "wd"]
COLUMN_PATTERNS = ["column", "col", "pillar", "pier"]
FURNITURE_PATTERNS = ["furniture", "furn", "chair", "table", "desk", "bed", "sofa", "cabinet"]


def _match_block_type(block_name: str, patterns: list) -> bool:
    """Check if a block name matches any of the given patterns (case-insensitive)."""
    name_lower = block_name.lower()
    return any(p in name_lower for p in patterns)


def parse_dxf(path: str) -> dict:
    """
    Parse a DXF file and extract geometric data for BOQ generation.

    Returns a dictionary with:
    - total_line_length: sum of all LINE entity lengths (in drawing units)
    - circle_count: number of CIRCLE entities
    - circle_total_circumference: total circumference of all circles
    - arc_count: number of ARC entities
    - arc_total_length: total arc length
    - polyline_count: number of LWPOLYLINE entities
    - polyline_total_length: total polyline perimeter
    - closed_polyline_area: total area of closed polylines (for slab/floor)
    - door_count: blocks matching door patterns
    - window_count: blocks matching window patterns
    - column_count: blocks matching column patterns
    - furniture_count: blocks matching furniture patterns
    - other_block_count: unclassified block inserts
    - lines: raw line data (for backward compatibility)
    """
    doc = ezdxf.readfile(path)
    msp = doc.modelspace()

    result = {
        "total_line_length": 0.0,
        "circle_count": 0,
        "circle_total_circumference": 0.0,
        "arc_count": 0,
        "arc_total_length": 0.0,
        "polyline_count": 0,
        "polyline_total_length": 0.0,
        "closed_polyline_area": 0.0,
        "door_count": 0,
        "window_count": 0,
        "column_count": 0,
        "furniture_count": 0,
        "other_block_count": 0,
        "lines": [],
    }

    # ── LINE entities ────────────────────────────
    for e in msp.query("LINE"):
        x1, y1 = e.dxf.start.x, e.dxf.start.y
        x2, y2 = e.dxf.end.x, e.dxf.end.y
        length = math.dist((x1, y1), (x2, y2))
        result["total_line_length"] += length
        result["lines"].append({"x1": x1, "y1": y1, "x2": x2, "y2": y2})

    # ── CIRCLE entities ──────────────────────────
    for e in msp.query("CIRCLE"):
        radius = e.dxf.radius
        result["circle_count"] += 1
        result["circle_total_circumference"] += 2 * math.pi * radius

    # ── ARC entities ─────────────────────────────
    for e in msp.query("ARC"):
        radius = e.dxf.radius
        start_angle = math.radians(e.dxf.start_angle)
        end_angle = math.radians(e.dxf.end_angle)
        # Handle angle wrapping
        angle = end_angle - start_angle
        if angle < 0:
            angle += 2 * math.pi
        arc_length = radius * angle
        result["arc_count"] += 1
        result["arc_total_length"] += arc_length

    # ── LWPOLYLINE entities ──────────────────────
    for e in msp.query("LWPOLYLINE"):
        try:
            # Get vertices
            points = list(e.get_points(format="xy"))
            if len(points) < 2:
                continue

            perimeter = 0.0
            for i in range(len(points) - 1):
                perimeter += math.dist(points[i], points[i + 1])

            # If closed, add closing segment
            if e.closed:
                perimeter += math.dist(points[-1], points[0])

            result["polyline_count"] += 1
            result["polyline_total_length"] += perimeter

            # Calculate area for closed polylines (Shoelace formula)
            if e.closed and len(points) >= 3:
                area = 0.0
                n = len(points)
                for i in range(n):
                    j = (i + 1) % n
                    area += points[i][0] * points[j][1]
                    area -= points[j][0] * points[i][1]
                area = abs(area) / 2.0
                result["closed_polyline_area"] += area
        except Exception:
            # Skip malformed polylines
            continue

    # ── INSERT (block references) ────────────────
    for e in msp.query("INSERT"):
        block_name = e.dxf.name
        if _match_block_type(block_name, DOOR_PATTERNS):
            result["door_count"] += 1
        elif _match_block_type(block_name, WINDOW_PATTERNS):
            result["window_count"] += 1
        elif _match_block_type(block_name, COLUMN_PATTERNS):
            result["column_count"] += 1
        elif _match_block_type(block_name, FURNITURE_PATTERNS):
            result["furniture_count"] += 1
        else:
            result["other_block_count"] += 1

    # Round all float values
    result["total_line_length"] = round(result["total_line_length"], 2)
    result["circle_total_circumference"] = round(result["circle_total_circumference"], 2)
    result["arc_total_length"] = round(result["arc_total_length"], 2)
    result["polyline_total_length"] = round(result["polyline_total_length"], 2)
    result["closed_polyline_area"] = round(result["closed_polyline_area"], 2)

    return result
