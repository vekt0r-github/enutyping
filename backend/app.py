import os
from flask import Flask, redirect, session

from database import db_session

# Blueprints
from api import api
from github import github

app = Flask(__name__, static_folder="../frontend/build", static_url_path='/static/')

app.secret_key = os.environ.get("FLASK_SECRET_KEY", "supersekritsfasdfsaflksjfajlksjfsk")
app.register_blueprint(api, url_prefix='/api')
app.register_blueprint(github, url_prefix='/api/login/github')

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
    return redirect('/')

@app.route('/api/unauthorized/')
def unauthorized():
    return 'wtf are you doing here?'

@app.route('/api/whoami', methods = ['GET'])
def whoami():
    user = session.get('user')
    if not user:
        # Not logged in
        return {}
    return user
