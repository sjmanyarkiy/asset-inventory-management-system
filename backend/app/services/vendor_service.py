import re
from app import db
from app.models.vendors import Vendor


def generate_vendor_code(name: str) -> str:
    """
    Generates a vendor code like DIG001, DIG002 based on vendor name.

    Logic:
    - Extract prefix from the first 3 alphabetic characters of the name
    - Find existing vendor codes with that prefix
    - Increment the highest sequence number
    """

    if not name:
        raise ValueError("Vendor name is required to generate vendor code")

    # -------------------------
    # Step 1: Generate prefix
    # -------------------------
    clean_name = re.sub(r'[^A-Za-z]', '', name).upper()

    if len(clean_name) < 3:
        prefix = (clean_name + "XXX")[:3]
    else:
        prefix = clean_name[:3]

    # -------------------------
    # Step 2: Fetch existing codes with same prefix
    # -------------------------
    existing_codes = (
        db.session.query(Vendor.vendor_code)
        .filter(Vendor.vendor_code.like(f"{prefix}%"))
        .all()
    )

    # -------------------------
    # Step 3: Extract numeric parts
    # -------------------------
    numbers = []
    for (code,) in existing_codes:
        match = re.match(rf"{prefix}(\d+)", code)
        if match:
            numbers.append(int(match.group(1)))

    # -------------------------
    # Step 4: Determine next sequence
    # -------------------------
    next_number = max(numbers, default=0) + 1

    return f"{prefix}{next_number:03d}"
