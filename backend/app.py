import os
import requests
from flask import Flask, redirect, request, url_for, jsonify, session

import oauth

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "supersekritsfasdfsaflksjfajlksjfsk")

@app.route('/')
def index():
    user, user_id = session.get('user'), session.get('user_id')
    if user and user_id:
        return f'Hello! You are logged in as {user} with id: {user_id}'
    return '<p>You are not logged in. Log in <a href="/login">here</a></p>'

@app.route('/login/', methods = ['GET'])
def login():
    auth = oauth.OAuth()
    return redirect(auth.request_url())

@app.route('/unauthorized/')
def unauthorized():
    return 'wtf are you doing here?'

@app.route('/login/authorized/')
def authorized():
    state = request.args.get('state')
    if state == oauth.OAUTH_SECRET_KEY:
        auth = oauth.OAuth()

        code = request.args.get('code')
        auth_response = auth.authorize(code)
        access_token = auth_response['access_token']
        gh_api_response = requests.get('https://api.github.com/user', headers = { 'Authorization': f'token {access_token}' })
        gh_user = gh_api_response.json()

        session['user'] = gh_user['login']
        session['user_id'] = gh_user['id']

        return redirect('/')
    else:
        return redirect('/unauthorized/')
