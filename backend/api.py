from flask import Blueprint, abort, request, session
from functools import wraps
from marshmallow import ValidationError
from operator import itemgetter
from sqlalchemy import func, and_

from models import Beatmap, Beatmapset, Score, User
from schemas import beatmap_schema, beatmaps_schema, beatmapset_schema, beatmapsets_schema, \
                    score_schema, scores_schema, scores_without_user_schema, user_schema, users_schema
from database import db_session

MAX_NUM_SCORES = 50

api = Blueprint('api', __name__)

def login_required(f):
    @wraps(f)
    def wrapper():
        user = session.get('user')
        if not user:
            return 'You are not logged in', 401
        return f(user['id'])
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

@api.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if user is None:
        abort(404, description = 'User not found')
    user_result = user_schema.dump(user)
    scores = user.scores.limit(MAX_NUM_SCORES)
    scores_result = scores_without_user_schema.dump(scores)
    return {"user": user_result, "scores": scores_result}

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

@api.route('/beatmapsets/<int:beatmapset_id>', methods=['GET'])
def get_beatmapset_with_diffs_and_scores(beatmapset_id):
    beatmapset = Beatmapset.query.get(beatmapset_id)
    if beatmapset is None:
        abort(404, description = 'Beatmapset not found')
    beatmapset_result = beatmapset_schema.dump(beatmapset)
    beatmaps_result = beatmaps_schema.dump(beatmapset.beatmaps)
    return { **process_beatmapset(beatmapset_result), 'beatmaps': beatmaps_result }

@api.route('/beatmapsets')
def get_beatmapset_list():
    search_query = request.args.get('search', '')
    title_result = Beatmapset.query.filter(Beatmapset.title.ilike('%' + search_query + '%')).all()
    # https://softwareengineering.stackexchange.com/questions/286293/whats-the-best-way-to-return-an-array-as-a-response-in-a-restful-api
    results = beatmapsets_schema.dump(title_result)
    return { 'beatmapsets': list(map(process_beatmapset, results)) }

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
    bid, score = itemgetter('beatmap_id', 'score')(data)
    s = Score(beatmap_id=bid, user_id=user_id, score=score)
    db_session.add(s)
    db_session.commit()

    score_result = score_schema.dump(s)
    return score_result, 201
