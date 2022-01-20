from flask import Blueprint, abort, request, session
from functools import wraps
from marshmallow import ValidationError
from operator import itemgetter
from sqlalchemy import func, and_

from models import Beatmap, Score, User
from schemas import beatmap_schema, beatmaps_metadata_schema, score_schema, scores_schema, user_schema, users_schema
from database import db_session

api = Blueprint('api', __name__)

def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwds):
        user = session.get('user')
        if not user:
            return 'You are not logged in', 401
        return f(*args, **kwds)
    return wrapper

def process_beatmap(beatmap):
    source = f"https://www.youtube.com/watch?v={beatmap['yt_id']}"
    return { **beatmap, 'source' : source }

@api.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if user is None:
        abort(404, description = 'User not found')
    user_result = user_schema.dump(user)
    return user_result

@api.route('/users/', methods=['GET'])
def get_users():
    users = User.query.all()
    res = users_schema.dump(users)
    return { 'users': res }

@api.route('/beatmaps/<int:beatmap_id>', methods=['GET'])
def get_beatmap_scores(beatmap_id):
    beatmap = Beatmap.query.get(beatmap_id)
    if beatmap is None:
        abort(404, description = 'Beatmap not found')
    beatmap_result = beatmap_schema.dump(beatmap)
    best_scores_subquery = db_session.query(Score.user_id, func.max(Score.score).label('maxscore')) \
                            .filter(Score.beatmap_id == beatmap_id) \
                            .group_by(Score.user_id) \
                            .subquery()
    scores = db_session.query(Score).join(best_scores_subquery, and_( \
            best_scores_subquery.c.user_id == Score.user_id,
            best_scores_subquery.c.maxscore == Score.score)).all()
    scores_result = scores_schema.dump(scores)
    return { **process_beatmap(beatmap_result), 'scores' : scores_result }

@api.route('/beatmaps')
def get_beatmap_list():
    search_query = request.args.get('search', '')
    title_result = Beatmap.query.filter(Beatmap.title.ilike('%' + search_query + '%')).all()
    # https://softwareengineering.stackexchange.com/questions/286293/whats-the-best-way-to-return-an-array-as-a-response-in-a-restful-api
    beatmap_results = beatmaps_metadata_schema.dump(title_result)
    return { 'beatmaps': list(map(process_beatmap, beatmap_results)) }

@api.route('/scores', methods=['POST'])
@login_required
def new_score():
    # XXX: UID probably is in session or something, so we can't fake for someone else
    # TODO: Probably need protection lol fake scores
    json_data = request.get_json()
    if not json_data:
        return 'No input provided', 400
    try:
        data = score_schema.load(json_data)
    except ValidationError as err:
        return err.messages, 400
    bid, uid, score = itemgetter('beatmap_id', 'user_id', 'score')(data)
    s = Score(beatmap_id=bid, user_id=uid, score=score)
    db_session.add(s)
    db_session.commit()

    score_result = score_schema.dump(s)
    return score_result, 201
