import re
from extensions import db
from models.asset import Asset
from models.asset_category import AssetCategory
from models.asset_type import AssetType
from models.vendor import Vendor
from models.department import Department


# =========================
# GENERATE ASSET CODE
# =========================
def generate_asset_code():
    """
    Generates sequential asset codes like AST-0001, AST-0002
    based on last inserted asset.
    """

    last_asset = Asset.query.order_by(Asset.id.desc()).first()

    if not last_asset or not last_asset.asset_code:
        return "AST-0001"

    match = re.match(r"AST-(\d+)", last_asset.asset_code)

    if not match:
        return "AST-0001"

    next_number = int(match.group(1)) + 1
    return f"AST-{next_number:04d}"


# =========================
# VALIDATE FOREIGN KEYS
# =========================
def validate_asset_foreign_keys(data):
    """
    Ensures all FK references exist before insert/update
    """

    if not db.session.get(AssetCategory, data.get('category_id')):
        return "Invalid category_id"

    if not db.session.get(AssetType, data.get('asset_type_id')):
        return "Invalid asset_type_id"

    if data.get('vendor_id') and not db.session.get(Vendor, data.get('vendor_id')):
        return "Invalid vendor_id"

    if data.get('department_id') and not db.session.get(Department, data.get('department_id')):
        return "Invalid department_id"

    return None


# =========================
# CHECK DUPLICATES (FIXED)
# =========================
def check_asset_duplicates(asset_code, barcode, exclude_id=None):
    """
    Prevent duplicate asset_code and barcode
    Excludes current record during update
    """

    query = Asset.query

    if exclude_id:
        query = query.filter(Asset.id != exclude_id)

    # Barcode must always be unique
    if barcode:
        existing_barcode = query.filter(Asset.barcode == barcode).first()
        if existing_barcode:
            return "Barcode already exists"

    # Asset code optional (auto-generated)
    if asset_code:
        existing_code = query.filter(Asset.asset_code == asset_code).first()
        if existing_code:
            return "Asset code already exists"

    return None


# =========================
# CREATE ASSET SERVICE
# =========================
def create_asset_service(data):
    """
    Handles full asset creation logic
    """

    # Step 1: FK validation
    error = validate_asset_foreign_keys(data)
    if error:
        return None, error

    # Step 2: generate asset code if not provided
    asset_code = data.get('asset_code') or generate_asset_code()

    # Step 3: duplicate check
    duplicate_error = check_asset_duplicates(
        asset_code,
        data.get('barcode')
    )

    if duplicate_error:
        return None, duplicate_error

    # Step 4: create asset object
    asset = Asset(
        name=data.get('name'),
        asset_code=asset_code,
        barcode=data.get('barcode'),
        status=data.get('status', 'available'),
        description=data.get('description'),
        image_url=data.get('image_url'),
        category_id=data.get('category_id'),
        asset_type_id=data.get('asset_type_id'),
        vendor_id=data.get('vendor_id'),
        department_id=data.get('department_id')
    )

    db.session.add(asset)

    return asset, None