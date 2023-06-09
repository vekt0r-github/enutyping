import os
from flask import Flask, redirect, session

from database import db_session

# Blueprints
from api import api
from oauth import github_blueprint, osu_blueprint, google_blueprint

app = Flask(__name__, static_folder="../frontend/build", static_url_path='/static/')

app.secret_key = os.environ.get("FLASK_SECRET_KEY", "supersekritsfasdfsaflksjfajlksjfsk")
app.register_blueprint(api, url_prefix='/api')
app.register_blueprint(github_blueprint, url_prefix='/api/login/github')
app.register_blueprint(osu_blueprint, url_prefix='/api/login/osu')
app.register_blueprint(google_blueprint, url_prefix='/api/login/google')

@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
    return app.send_static_file('index.html')

@app.route('/api/logout', methods = ['POST'])
def logout():
    session.pop('user', None)
    return { 'success': True }

@app.route('/api/unauthorized/')
def unauthorized():
    return 'wtf are you doing here?'
