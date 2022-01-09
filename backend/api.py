from flask import Blueprint, abort, request
from marshmallow import ValidationError
from operator import itemgetter

from models import Beatmap, Score
from schemas import beatmap_schema, score_schema, scores_schema
from database import db_session

api = Blueprint('api', __name__)

@api.route('/beatmaps/<int:beatmap_id>', methods=['GET'])
def get_beatmap_scores(beatmap_id):
    beatmap = Beatmap.query.get(beatmap_id)
    if beatmap is None:
        abort(404, description = 'Beatmap not found')

    beatmap_result = beatmap_schema.dump(beatmap)
    scores_result = scores_schema.dump(beatmap.scores)
    return {'beatmap': beatmap_result, 'scores': scores_result}

@api.route('/scores', methods=['POST'])
def new_score():
    # XXX: UID probably is in session or something
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
