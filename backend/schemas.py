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
    user_id = fields.Int(load_only=True)
    user = fields.Nested(UserSchema(only=("name", "id")), dump_only=True)

score_schema = ScoreSchema()
scores_schema = ScoreSchema(many=True)

class BeatmapSchema(Schema):
    id = fields.Int(dump_only=True)
    artist = fields.Str()
    title = fields.Str()
    yt_id = fields.Str()
    # scores = fields.Nested(scores_schema)
    content = fields.Str()

beatmap_schema = BeatmapSchema()
beatmaps_metadata_schema = BeatmapSchema(exclude=['content'], many=True)
