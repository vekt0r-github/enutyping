from marshmallow import Schema, fields

class ScoreSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int()
    beatmap_id = fields.Int()
    score = fields.Int()

score_schema = ScoreSchema()
