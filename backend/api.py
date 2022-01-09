from flask import Blueprint, abort, request
from operator import itemgetter

from models import Beatmap, Score
from database import db_session

api = Blueprint('api', __name__)

@api.route('/beatmaps/<int:beatmap_id>', methods=['GET'])
def get_beatmap_scores(beatmap_id):
    beatmap = Beatmap.query.get(beatmap_id)
    if beatmap is None:
        abort(404, description = 'Beatmap not found')

    return beatmap.beatmap_data()

@api.route('/scores', methods=['POST'])
def new_score():
    # XXX: UID probably is in session or something
    # TODO: Probably need protection lol fake scores
    bid, uid, score = itemgetter('beatmap_id', 'user_id', 'score')(request.json)
    s = Score(beatmap_id=bid, user_id=uid, score=score)
    db_session.add(s)
    db_session.commit()
    
    return s.as_dict(), 201
