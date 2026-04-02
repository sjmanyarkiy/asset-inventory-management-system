from flask_marshmallow import Marshmallow
from marshmallow import fields

ma = Marshmallow()


class UserSchema(ma.Schema):
    id = fields.Int()
    name = fields.Str()
    email = fields.Email()
    role = fields.Str()


class AssetSchema(ma.Schema):
    id = fields.Int()
    barcode = fields.Str()
    tag = fields.Str()
    name = fields.Str()
    category = fields.Str()
    location = fields.Str()


class AssignmentSchema(ma.Schema):
    assignment_id = fields.Int()
    asset_id = fields.Int()
    asset_tag = fields.Str()
    asset_name = fields.Str()
    assigned_to = fields.Int()
    assigned_at = fields.DateTime()


class RepairSchema(ma.Schema):
    repair_id = fields.Int()
    asset_id = fields.Int()
    status = fields.Str()
    reported_at = fields.DateTime()
