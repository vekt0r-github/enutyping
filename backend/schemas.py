from marshmallow import Schema, fields

class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str()

user_schema = UserSchema()
users_schema = UserSchema(many=True)

class ScoreSchema(Schema):
    id = fields.Int(dump_only=True)
    beatmap_id = fields.Int()
    score = fields.Int()
    user = fields.Nested(UserSchema(only=("name", "id")))

score_schema = ScoreSchema()
scores_schema = ScoreSchema(many=True)

class BeatmapSchema(Schema):
    id = fields.Int(dump_only=True)
    artist = fields.Str()
    title = fields.Str()
    source = fields.Str()
    # scores = fields.Nested(scores_schema)
    content = fields.Str()

beatmap_schema = BeatmapSchema()
beatmaps_metadata_schema = BeatmapSchema(exclude=['content'], many=True)
