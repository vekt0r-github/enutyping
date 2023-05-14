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

def process_beatmap(beatmap):
    source = f"https://www.youtube.com/watch?v={beatmap['yt_id']}"
    return { **beatmap, 'source' : source }

################################################################
######################### USER METHODS #########################
################################################################

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

################################################################
######################### BEATMAP METHODS #########################
################################################################

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
    return { **process_beatmap(beatmap_result), 'scores' : scores_result, 'beatmapset' : beatmapset_result }

@api.route('/beatmaps', methods=['POST'])
@login_required
def add_beatmap(user_id):
    '''
    Data
    ----
    beatmapset_id
    artist
    title
    artist_original
    title_original
    yt_id
    preview_point
    duration
    diffname
    content
    kpm
    '''
    json_data = request.get_json()
    if not json_data:
        return 'No input provided', 400
    try:
        data = beatmap_schema.load(json_data)
    except ValidationError as err:
        return err.messages, 400

    bms_id = data['beatmapset_id']

    # artist, title, artist_original, title_original, yt_id, preview_point, duration = \
    #     itemgetter('artist', 'title', 'artist_original', 'title_original', 'yt_id', 'preview_point', 'duration')(data)

    exists_subq = Beatmapset.query.filter(
            Beatmapset.owner_id == user_id,
            Beatmapset.id == bms_id).exists()
    exists = db_session.query(exists_subq).scalar()
    if not exists:
        return 'Beatmapset does not exist or you do not own it!', 400

    beatmap = Beatmap(**data)
    db_session.add(beatmap)
    db_session.commit()

    res = beatmap_schema.dump(beatmap)
    return res, 201

@api.route('/beatmaps/<int:beatmap_id>', methods=['PUT'])
@login_required
def update_beatmap(user_id, beatmap_id):
    # TODO: do we need to run process_beatmap on res
    '''
    Data: some subset of fields for add method, except for beatmapset_id
    '''
    json_data = request.get_json()
    if not json_data:
        return 'No input provided', 400
    try:
        data = beatmap_schema.load(json_data)
    except ValidationError as err:
        return err.messages, 400

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

    for k, v in data.items():
        setattr(beatmap, k, v)
    db_session.commit()
    res = beatmap_schema.dump(beatmap)
    return res

@api.route('/beatmaps/<int:beatmap_id>', methods=['DELETE'])
@login_required
def delete_beatmap(user_id, beatmap_id):
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
    db_session.delete(beatmap)
    db_session.commit()
    return { 'success': True, 'beatmapset_id': bms_id }

################################################################
######################### MAPSET METHODS #########################
################################################################

@api.route('/beatmapsets/<int:beatmapset_id>', methods=['GET'])
def get_beatmapset_with_diffs_and_scores(beatmapset_id):
    # TODO: do we need to run process_beatmap on result
    beatmapset = Beatmapset.query.get(beatmapset_id)
    if beatmapset is None:
        abort(404, description = 'Beatmapset not found')
    beatmapset_result = beatmapset_schema.dump(beatmapset)
    beatmaps_result = beatmaps_schema.dump(beatmapset.beatmaps)
    # list(map(process_beatmap, beatmaps_result))
    return { **beatmapset_result, 'beatmaps': beatmaps_result }

@api.route('/beatmapsets', methods=['GET'])
def get_beatmapset_list():
    search_query = request.args.get('search', '')
    owner_result = Beatmapset.query.filter(Beatmapset.owner_id.ilike('%' + search_query + '%')).all()
    # https://softwareengineering.stackexchange.com/questions/286293/whats-the-best-way-to-return-an-array-as-a-response-in-a-restful-api
    return { 'beatmapsets': list(beatmapsets_schema.dump(owner_result)) }

@api.route('/beatmapsets', methods=['POST'])
@login_required
def add_beatmapset(user_id):
    '''
    Data
    ----
    name
    description
    icon_url
    '''
    json_data = request.get_json()
    if not json_data:
        return 'No input provided', 400

    try:
        data = beatmapset_schema.load(json_data)
    except ValidationError as err:
        return err.messages, 400

    owner = User.query.get(user_id)
    assert owner is not None

    new_bmset = Beatmapset(**data, owner_id=user_id)
    db_session.add(new_bmset)
    db_session.commit()
# Beatmapset.query.get(new_bmset.id)
    res = beatmapset_schema.dump(new_bmset)
    print(res)
    return res, 201

@api.route('/beatmapsets/<int:beatmapset_id>', methods=['PUT'])
@login_required
def update_beatmapset(user_id, beatmapset_id):
    '''
    Data: some subset of fields for add method
    '''
    json_data = request.get_json()
    if not json_data:
        return 'No input provided', 400
    try:
        data = beatmapset_schema.load(json_data)
    except ValidationError as err:
        return err.messages, 400

    bmset = Beatmapset.query.get(beatmapset_id)
    if not bmset or bmset.owner_id != user_id:
        return 'Beatmapset does not exist or you do not own it!', 400

    for k, v in data.items():
        setattr(bmset, k, v)
    db_session.commit()
    res = beatmapset_schema.dump(bmset)
    return res

@api.route('/beatmapsets/<int:beatmapset_id>', methods=['DELETE'])
@login_required
def delete_beatmapset(user_id, beatmapset_id):
    beatmap_set = Beatmapset.query.filter(
            Beatmapset.owner_id == user_id,
            Beatmapset.id == beatmapset_id).one_or_none()
    if not beatmap_set:
        return 'Beatmapset does not exist or you do not own it!', 400
    db_session.delete(beatmap_set)
    db_session.commit()
    return { 'success': True }

################################################################
######################### OTHER METHODS #########################
################################################################

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
    s = Score(**data, user_id=user_id, time_unix=int(time()))
    user = User.query.filter_by(id=user_id).first()
    if not user:
       return 'Invalid User', 400

    user.key_accuracy = (user.key_accuracy * user.play_count + s.key_accuracy) / (user.play_count + 1)
    user.kana_accuracy = (user.kana_accuracy * user.play_count + s.kana_accuracy) / (user.play_count + 1)
    user.play_count += 1
    user.total_score += s.score
    db_session.add(s)
    db_session.commit()

    score_result = score_schema.dump(s)
    return score_result, 201
