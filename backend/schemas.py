from marshmallow import Schema, fields

class UserStats(Schema):
    join_time = fields.Int()
    key_accuracy = fields.Float()
    kana_accuracy = fields.Float()
    total_score = fields.Int()
    play_count = fields.Int()

class UserSchema(Schema):
    id = fields.Str(dump_only=True)
    name = fields.Str()
    avatar_url = fields.Str(dump_only=True)

user_schema = UserSchema()
users_schema = UserSchema(many=True)
user_stats_schema = UserStats()

class ScoreSchema(Schema):
    id = fields.Int(dump_only=True)
    beatmap_id = fields.Int()
    score = fields.Int()
    key_accuracy = fields.Float()
    kana_accuracy = fields.Float()
    user_id = fields.Str(load_only=True)
    user = fields.Nested(UserSchema(only=("id", "name", "avatar_url")), dump_only=True)
    time_unix = fields.Int()
    speed_modification = fields.Float()

score_schema = ScoreSchema()
# Nice to for account page since we know the user
scores_without_user_schema = ScoreSchema(many=True, exclude=("user",))
scores_schema = ScoreSchema(many=True)

# TODO: probably a lot of these schemas are required=True, but w/e

class BeatmapSchema(Schema):
    id = fields.Int(dump_only=True)
    scores = fields.Nested(score_schema, dump_only=True)
    # beatmapset_id = fields.Int(required=True, load_only=True)
    beatmapset_id = fields.Int(load_only=True)
    diffname = fields.Str()
    content = fields.Str()
    kpm = fields.Float()

beatmap_schema = BeatmapSchema()
beatmaps_schema = BeatmapSchema(many=True)

class BeatmapsetSchema(Schema):
    id = fields.Int(dump_only=True)
    artist = fields.Str()
    title = fields.Str()
    artist_original = fields.Str()
    title_original = fields.Str()
    yt_id = fields.Str()
    preview_point = fields.Int()
    duration = fields.Int()
    owner = fields.Nested(UserSchema(only=("name", "id")), dump_only=True)
    beatmaps = fields.Nested(BeatmapSchema(only=("diffname", "id", "kpm", "content")), many=True, dump_only=True)

beatmapset_schema = BeatmapsetSchema()
beatmapsets_schema = BeatmapsetSchema(many=True)
