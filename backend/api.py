from flask import Blueprint, jsonify

from models import Beatmap

api = Blueprint('api', __name__)

@api.route('/beatmaps/<int:beatmap_id>', methods=['GET'])
def get_beatmap_scores(beatmap_id):
    beatmap = Beatmap.query.filter(Beatmap.id == beatmap_id).one()
    return jsonify(beatmap.scores_select())
