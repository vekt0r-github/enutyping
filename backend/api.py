from flask import Blueprint, abort, request, session
from functools import wraps
from marshmallow import ValidationError
from operator import itemgetter
from sqlalchemy import func, and_
from time import time

from models import Beatmap, Beatmapset, Score, User
from schemas import beatmap_schema, beatmaps_schema, beatmapset_schema, beatmapsets_schema, \
                    score_schema, scores_schema, scores_without_user_schema, user_schema, users_schema, user_stats_schema
from database import db_session

MAX_NUM_SCORES = 50

api = Blueprint('api', __name__)

def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        user = session.get('user')
        if not user:
            return 'You are not logged in', 401
        return f(user['id'], *args, **kwargs)
    return wrapper

def process_beatmapset(beatmapset):
    source = f"https://www.youtube.com/watch?v={beatmapset['yt_id']}"
    return { **beatmapset, 'source' : source }

@api.route('/me/changename', methods=['POST'])
@login_required
def change_name(user_id):
    json_data = request.get_json()
    if not json_data:
        return 'No input provided', 400
    user = User.query.get(user_id)
    requested_name = json_data['requested_name']
    if not requested_name or requested_name.endswith(("google", "osu", "github")):
        return 'We do not like your name', 400

    exists_subq = User.query.filter(User.name == requested_name).exists()
    exists = db_session.query(exists_subq).scalar()
    if exists:
        return { 'success': False }, 409
    user.name = requested_name
    db_session.commit()
    return { 'success': True, 'new_name': requested_name }

@api.route('/whoami', methods = ['GET'])
def whoami():
    user = session.get('user')
    if not user:
        # Not logged in
        return {}
    user = User.query.get(user['id'])
    res = user_schema.dump(user)
    return res

@api.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if user is None:
        abort(404, description = 'User not found')
    user_result = user_schema.dump(user)
    user_stats_result = user_stats_schema.dump(user)
    scores = user.scores.limit(MAX_NUM_SCORES)
    scores_result = scores_without_user_schema.dump(scores)
    return {"user": user_result, "scores": scores_result, "stats": user_stats_result}

@api.route('/users', methods=['GET'])
def get_users():
    search_query = request.args.get('search', '')
    users = User.query.filter(User.name.ilike(f'%{search_query}%')).all()
    res = users_schema.dump(users)
    return { 'users': res }

@api.route('/beatmaps/<int:beatmap_id>', methods=['GET'])
def get_beatmap_with_set_and_scores(beatmap_id):
    beatmap = Beatmap.query.get(beatmap_id)
    if beatmap is None:
        abort(404, description = 'Beatmap not found')
    beatmap_result = beatmap_schema.dump(beatmap)
    best_scores_subquery = db_session.query(Score.user_id, func.max(Score.score).label('maxscore')) \
                            .filter(Score.beatmap_id == beatmap_id) \
                            .group_by(Score.user_id) \
                            .subquery()
    scores = db_session.query(Score).join(best_scores_subquery, and_( \
            best_scores_subquery.c.user_id == Score.user_id, \
            best_scores_subquery.c.maxscore == Score.score)) \
            .order_by(Score.score.desc()).limit(MAX_NUM_SCORES).all()
    scores_result = scores_schema.dump(scores)
    beatmapset_result = beatmapset_schema.dump(beatmap.beatmapset)
    return { **beatmap_result, 'scores' : scores_result, 'beatmapset' : process_beatmapset(beatmapset_result) }

@api.route('/beatmaps/<int:beatmap_id>', methods=['PUT'])
@login_required
def update_beatmap(user_id, beatmap_id):
    '''
    Data
    ----
    diffname
    content
    '''
    json_data = request.get_json()
    if not json_data:
        return 'No input provided', 400
    try:
        data = beatmap_schema.load(json_data)
    except ValidationError as err:
        return err.messages, 400

    diffname, content = itemgetter('diffname', 'content')(data)

    beatmap = Beatmap.query.get(beatmap_id)
    if not beatmap:
        return 'Beatmap does not exist!', 400
    bms_id = beatmap.beatmapset_id

    exists_subq = Beatmapset.query.filter(
            Beatmapset.owner_id == user_id,
            Beatmapset.id == bms_id).exists()
    exists = db_session.query(exists_subq).scalar()
    if not exists:
        return 'Beatmapset does not exist or you do not own it!', 400

    beatmap.content = content
    beatmap.diffname = diffname
    db_session.commit()
    res = beatmap_schema.dump(beatmap)
    return res

@api.route('/beatmaps', methods=['POST'])
@login_required
def add_beatmap(user_id):
    '''
    Data
    ----
    beatmapset_id
    diffname
    content
    '''
    json_data = request.get_json()
    if not json_data:
        return 'No input provided', 400
    try:
        data = beatmap_schema.load(json_data)
    except ValidationError as err:
        return err.messages, 400

    bms_id, diffname, content = itemgetter('beatmapset_id', 'diffname', 'content')(data)

    exists_subq = Beatmapset.query.filter(
            Beatmapset.owner_id == user_id,
            Beatmapset.id == bms_id).exists()
    exists = db_session.query(exists_subq).scalar()
    if not exists:
        return 'Beatmapset does not exist or you do not own it!', 400

    beatmap = Beatmap(beatmapset_id=bms_id, diffname=diffname, content=content)
    db_session.add(beatmap)
    db_session.commit()

    res = beatmap_schema.dump(beatmap)
    return res, 201

@api.route('/beatmapsets/<int:beatmapset_id>', methods=['GET'])
def get_beatmapset_with_diffs_and_scores(beatmapset_id):
    beatmapset = Beatmapset.query.get(beatmapset_id)
    if beatmapset is None:
        abort(404, description = 'Beatmapset not found')
    beatmapset_result = beatmapset_schema.dump(beatmapset)
    beatmaps_result = beatmaps_schema.dump(beatmapset.beatmaps)
    return { **process_beatmapset(beatmapset_result), 'beatmaps': beatmaps_result }

@api.route('/beatmapsets', methods=['GET'])
def get_beatmapset_list():
    search_query = request.args.get('search', '')
    title_result = Beatmapset.query.filter(Beatmapset.title.ilike('%' + search_query + '%')).all()
    # https://softwareengineering.stackexchange.com/questions/286293/whats-the-best-way-to-return-an-array-as-a-response-in-a-restful-api
    results = beatmapsets_schema.dump(title_result)
    return { 'beatmapsets': list(map(process_beatmapset, results)) }

@api.route('/beatmapsets', methods=['POST'])
@login_required
def add_beatmapset(user_id):
    '''
    Data
    ----
    artist
    title
    artist_original
    title_original
    yt_id
    preview_point
    duration
    '''
    json_data = request.get_json()
    if not json_data:
        return 'No input provided', 400

    try:
        data = beatmapset_schema.load(json_data)
    except ValidationError as err:
        return err.messages, 400

    artist, title, artist_original, title_original, yt_id, preview_point, duration = \
        itemgetter('artist', 'title', 'artist_original', 'title_original', 'yt_id', 'preview_point', 'duration')(data)

    owner = User.query.get(user_id)
    assert owner is not None

    new_bmset = Beatmapset(artist=artist, \
                           title=title, \
                           artist_original=artist_original, \
                           title_original=title_original, \
                           yt_id=yt_id, \
                           preview_point=preview_point, \
                           owner=owner, \
                           duration=duration)

    db_session.add(new_bmset)
    db_session.commit()
    res = beatmapset_schema.dump(Beatmapset.query.get(new_bmset.id))
    return res, 201

@api.route('/scores', methods=['POST'])
@login_required
def new_score(user_id):
    # XXX: UID probably is in session or something, so we can't fake for someone else
    # TODO: Probably need protection lol fake scores
    json_data = request.get_json()
    if not json_data:
        return 'No input provided', 400
    try:
        data = score_schema.load(json_data)
    except ValidationError as err:
        return err.messages, 400
    print(data)
    bid, score, key_accuracy, kana_accuracy = itemgetter('beatmap_id', 'score', 'key_accuracy', 'kana_accuracy')(data)
    s = Score(beatmap_id=bid, user_id=user_id, score=score, key_accuracy=key_accuracy, kana_accuracy=kana_accuracy, time_unix=int(time()))
    user = User.query.filter_by(id=user_id).first()
    if not user:
       return 'Invalid User', 400

    user.key_accuracy = (user.key_accuracy * user.play_count + key_accuracy) / (user.play_count + 1)
    user.kana_accuracy = (user.kana_accuracy * user.play_count + kana_accuracy) / (user.play_count + 1)
    user.play_count += 1
    user.total_score += score
    db_session.add(s)
    db_session.commit()

    score_result = score_schema.dump(s)
    return score_result, 201
