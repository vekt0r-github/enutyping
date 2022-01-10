import os
import requests
from flask import Flask, redirect, request, url_for, session

import oauth
from database import db_session
from models import User
from schemas import user_schema
from api import api

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "supersekritsfasdfsaflksjfajlksjfsk")
app.register_blueprint(api, url_prefix='/api')

@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()

@app.route('/')
def index():
    user, user_id = session.get('user'), session.get('user_id')
    if user and user_id:
        return f'Hello! You are logged in as {user} with id: {user_id}'
    return '<p>You are not logged in. Log in <a href="/login">here</a></p>'

# TODO, api start probably nice

@app.route('/api/login/', methods = ['GET'])
def login():
    auth = oauth.OAuth()
    return redirect(auth.request_url())

@app.route('/api/unauthorized/')
def unauthorized():
    return 'wtf are you doing here?'

@app.route('/api/login/authorize', methods = ['POST'])
def authorized():
    req_json = request.get_json()
    state = req_json.get('state')
    if state == oauth.OAUTH_SECRET_KEY:
        def get_or_create_user(id, name):
            user = User.query.get(id)
            if user:
                return user
            user = User(id, name)
            db_session.add(user)
            db_session.commit()
            return user

        auth = oauth.OAuth()

        code = req_json.get('code')
        auth_response = auth.authorize(code)
        access_token = auth_response['access_token']
        gh_api_response = requests.get('https://api.github.com/user', headers = { 'Authorization': f'token {access_token}' })
        gh_user = gh_api_response.json()
        gh_name = gh_user['login']
        gh_uid = gh_user['id']

        session['user'] = gh_name
        session['user_id'] = gh_uid

        user = get_or_create_user(gh_uid, gh_name)
        return user_schema.dump(user)
    else:
        return redirect('/api/unauthorized/')
