def map_to_boq(raw):

    return [
        {
            "item_no": 1,
            "component": "Wall Conduits / Linear Runs",
            "description": "Electrical conduit runs extracted from CAD drawing",
            "quantity": round(raw["total_line_length"], 2),
            "unit": "m",
            "rate": 0,
            "total": 0
        },

        {
            "item_no": 2,
            "component": "Doors",
            "description": "Door count from CAD blocks",
            "quantity": raw.get("door_count", 0),
            "unit": "nos",
            "rate": 0,
            "total": 0
        },

        {
            "item_no": 3,
            "component": "Floor Area",
            "description": "Slab / floor area from CAD",
            "quantity": round(raw.get("slab_area", 0), 2),
            "unit": "m²",
            "rate": 0,
            "total": 0
        }
    ]
