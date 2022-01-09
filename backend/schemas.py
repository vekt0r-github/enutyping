from marshmallow import Schema, fields

class ScoreSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int()
    beatmap_id = fields.Int()
    score = fields.Int()

score_schema = ScoreSchema()
scores_schema = ScoreSchema(many=True)

class BeatmapSchema(Schema):
    id = fields.Int(dump_only=True)
    song_name = fields.Str()
    # scores = fields.Nested(scores_schema)

beatmap_schema = BeatmapSchema()

class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str()

user_schema = UserSchema()
