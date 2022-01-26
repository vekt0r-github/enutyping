from flask import Blueprint, redirect, request, session
import os 
import requests
import random

from models import User
from schemas import UserSchema
from database import db_session

# Github OAuth
GITHUB_OAUTH_CLIENT_ID = os.environ.get('GITHUB_OAUTH_CLIENT_ID')
GITHUB_OAUTH_CLIENT_SECRET = os.environ.get('GITHUB_OAUTH_CLIENT_SECRET')
GITHUB_OAUTH_REDIRECT_URL = os.environ.get('GITHUB_OAUTH_REDIRECT_URL')
GITHUB_REQUEST_AUTH_URL = 'https://github.com/login/oauth/authorize'
GITHUB_REQUEST_TOKEN_URL = 'https://github.com/login/oauth/access_token'
GITHUB_API_URL = 'https://api.github.com/user'

# osu! OAuth
OSU_OAUTH_CLIENT_ID = os.environ.get('OSU_OAUTH_CLIENT_ID')
OSU_OAUTH_CLIENT_SECRET = os.environ.get('OSU_OAUTH_CLIENT_SECRET')
OSU_OAUTH_REDIRECT_URL = os.environ.get('OSU_OAUTH_REDIRECT_URL')
OSU_REQUEST_AUTH_URL = 'https://osu.ppy.sh/oauth/authorize'
OSU_REQUEST_TOKEN_URL = 'https://osu.ppy.sh/oauth/token'
OSU_API_URL = 'https://osu.ppy.sh/api/v2/me'

# Google OAuth
GOOGLE_OAUTH_CLIENT_ID = os.environ.get('GOOGLE_OAUTH_CLIENT_ID')
GOOGLE_OAUTH_CLIENT_SECRET = os.environ.get('GOOGLE_OAUTH_CLIENT_SECRET')
GOOGLE_OAUTH_REDIRECT_URL = os.environ.get('GOOGLE_OAUTH_REDIRECT_URL')
GOOGLE_REQUEST_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
GOOGLE_SCOPE = 'https://www.googleapis.com/auth/userinfo.profile'
GOOGLE_REQUEST_TOKEN_URL = 'https://oauth2.googleapis.com/token'
GOOGLE_API_URL = 'https://www.googleapis.com/userinfo/v2/me'

OAUTH_SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", "supersekritsfasdfsaflksjfajlksjfsk")

class OAuth():
    def __init__(self, client_id, client_secret, secret_key, auth_url, token_url, redirect_uri, api_url, scope):
        self.client_id = client_id
        self.client_secret = client_secret
        self.secret_key = secret_key
        self.auth_url = auth_url
        self.token_url = token_url
        self.redirect_uri = redirect_uri
        self.api_url = api_url
        self.scope = scope

    def request_url(self):
        params = {
            'client_id': self.client_id,
            'state': self.secret_key,
            'response_type': 'code',
        }
        if self.redirect_uri: params['redirect_uri'] = self.redirect_uri
        if self.scope: params['scope'] = self.scope
        p = requests.Request('GET', self.auth_url, params = params).prepare()
        return p.url
    
    def authorize(self, code):
        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': self.redirect_uri,
        }
        headers = {
            'Accept': 'application/json'
        }
        res = requests.post(self.token_url, headers = headers, data = data)
        return res.json()

def construct_oauth_blueprint(provider, oauth, get_user_func):
    bp = Blueprint(provider, __name__)

    @bp.route('/request', methods = ['GET'])
    def login():
        url = oauth.request_url()
        if not url:
            return "No valid URL!", 500
        return redirect(url)

    @bp.route('/authorize', methods = ['POST'])
    def authorized():
        req_json = request.get_json()
        if not req_json:
            return "No input!", 400
        state = req_json.get('state')
        if state == oauth.secret_key:
            def get_or_create_user(id, name, avatar_url):
                user = User.query.get(id)
                if user:
                    return user
                user = User(id, name, avatar_url)
                db_session.add(user)
                db_session.commit()
                return user

            code = req_json.get('code')
            auth_response = oauth.authorize(code)
            access_token = auth_response['access_token']
            user_res = get_user_func(oauth, access_token)

            user = get_or_create_user(user_res['uid'], user_res['name'], user_res['avatar_url'])
            user_object = UserSchema().dump(user)
            session['user'] = user_object
            return user_object
        else:
            return redirect('/api/unauthorized/')

    return bp

def generate_name(og_name):
    name = og_name
    while True:
        user = User.query.get(name)
        if not user:
            return name
        name = f'{og_name}{random.randrange(0, 1000):03}'

def github_user_func(oauth, token):
    api_response = requests.get(oauth.api_url, headers = { 'Authorization': f'token {token}' })
    user = api_response.json()
    name = generate_name(user['login'])
    uid = str(user['id']) + 'github'
    avatar_url = user['avatar_url']
    return { 'name': name, 'uid': uid, 'avatar_url': avatar_url }

def osu_user_func(oauth, token):
    api_response = requests.get(oauth.api_url, headers = { 'Authorization': f'Bearer {token}' })
    user = api_response.json()
    name = generate_name(user['username'])
    uid = str(user['id']) + 'osu'
    avatar_url = user['avatar_url']
    return { 'name': name, 'uid': uid, 'avatar_url': avatar_url }

def google_user_func(oauth, token):
    api_response = requests.get(oauth.api_url, headers = { 'Authorization': f'Bearer {token}' })
    user = api_response.json()
    name = generate_name(user['given_name'])
    uid = str(user['id']) + 'google'
    avatar_url = user['picture']
    return { 'name': name, 'uid': uid, 'avatar_url': avatar_url }

github_oauth = OAuth(GITHUB_OAUTH_CLIENT_ID, \
                     GITHUB_OAUTH_CLIENT_SECRET, \
                     OAUTH_SECRET_KEY, \
                     GITHUB_REQUEST_AUTH_URL, \
                     GITHUB_REQUEST_TOKEN_URL, \
                     GITHUB_OAUTH_REDIRECT_URL, \
                     GITHUB_API_URL, \
                     None)

osu_oauth = OAuth(OSU_OAUTH_CLIENT_ID, \
                  OSU_OAUTH_CLIENT_SECRET, \
                  OAUTH_SECRET_KEY, \
                  OSU_REQUEST_AUTH_URL, \
                  OSU_REQUEST_TOKEN_URL, \
                  OSU_OAUTH_REDIRECT_URL, \
                  OSU_API_URL, \
                  None)

google_oauth = OAuth(GOOGLE_OAUTH_CLIENT_ID, \
                     GOOGLE_OAUTH_CLIENT_SECRET, \
                     OAUTH_SECRET_KEY, \
                     GOOGLE_REQUEST_AUTH_URL, \
                     GOOGLE_REQUEST_TOKEN_URL, \
                     GOOGLE_OAUTH_REDIRECT_URL, \
                     GOOGLE_API_URL, \
                     GOOGLE_SCOPE)

github_blueprint = construct_oauth_blueprint("github", github_oauth, github_user_func)
osu_blueprint = construct_oauth_blueprint("osu", osu_oauth, osu_user_func)
google_blueprint = construct_oauth_blueprint("google", google_oauth, google_user_func)
