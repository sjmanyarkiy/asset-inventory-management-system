from app import db
from app.models.asset import Asset


# =========================
# ENTITY → FOREIGN KEY MAP
# =========================
SAFE_DELETE_MAP = {
    "vendor": ("asset", "vendor_id"),
    "category": ("asset", "category_id"),
    "asset_type": ("asset", "asset_type_id"),
    "department": ("asset", "department_id"),
}


# =========================
# MODEL REGISTRY
# =========================
MODEL_MAP = {
    "asset": Asset,
}


# =========================
# GLOBAL SAFE DELETE ENGINE
# =========================
def check_safe_delete(entity: str, entity_id: int):
    """
    Returns:
        (bool, message)
    """

    rule = SAFE_DELETE_MAP.get(entity)

    if not rule:
        return False, f"Invalid entity: {entity}"

    model_key, fk_field = rule
    model = MODEL_MAP.get(model_key)

    if not model:
        return False, f"Model not found for: {model_key}"

    try:
        count = model.query.filter(
            getattr(model, fk_field) == entity_id
        ).count()

        if count > 0:
            return False, f"{entity} is in use ({count} linked records)"

        return True, "Safe to delete"

    except Exception as e:
        return False, f"Safe delete failed: {str(e)}"