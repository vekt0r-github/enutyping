from marshmallow import Schema, fields

class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str()
    avatar_url = fields.Str(dump_only=True)

user_schema = UserSchema()
users_schema = UserSchema(many=True)

class ScoreSchema(Schema):
    id = fields.Int(dump_only=True)
    beatmap_id = fields.Int()
    score = fields.Int()
    user_id = fields.Int(load_only=True)
    user = fields.Nested(UserSchema(only=("id", "name", "avatar_url")), dump_only=True)

score_schema = ScoreSchema()
# Nice to for account page since we know the user
scores_without_user_schema = ScoreSchema(many=True, exclude=("user",))
scores_schema = ScoreSchema(many=True)

class BeatmapSchema(Schema):
    id = fields.Int(dump_only=True)
    scores = fields.Nested(score_schema, dump_only=True)
    diffname = fields.Str()
    content = fields.Str()

beatmap_schema = BeatmapSchema()

class BeatmapsetSchema(Schema):
    id = fields.Int(dump_only=True)
    artist = fields.Str()
    title = fields.Str()
    artist_original = fields.Str()
    title_original = fields.Str()
    yt_id = fields.Str()
    preview_point = fields.Int()
    owner = fields.Nested(UserSchema(only=("name", "id")), dump_only=True)
    beatmaps = fields.Nested(BeatmapSchema(only=("diffname", "id")), many=True, dump_only=True)

beatmapset_schema = BeatmapsetSchema()
beatmapsets_schema = BeatmapsetSchema(many=True)
