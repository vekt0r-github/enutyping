import requests
from flask import Blueprint, redirect, request, session

from oauth import github_oauth
from models import User
from schemas import UserSchema
from database import db_session

github = Blueprint('github', __name__)

@github.route('/request', methods = ['GET'])
def login():
    url = github_oauth.request_url()
    if not url:
        return "No valid URL!", 500
    return redirect(url)

@github.route('/authorize', methods = ['POST'])
def authorized():
    req_json = request.get_json()
    if not req_json:
        return "No input!", 400
    state = req_json.get('state')
    if state == github_oauth.secret_key:
        def get_or_create_user(id, name, avatar_url):
            user = User.query.get(id)
            if user:
                return user
            user = User(id, name, avatar_url)
            db_session.add(user)
            db_session.commit()
            return user

        code = req_json.get('code')
        auth_response = github_oauth.authorize(code)
        access_token = auth_response['access_token']
        gh_api_response = requests.get('https://api.github.com/user', headers = { 'Authorization': f'token {access_token}' })
        gh_user = gh_api_response.json()
        gh_name = gh_user['login']
        gh_uid = gh_user['id']
        gh_avatar_url = gh_user['avatar_url']

        user = get_or_create_user(gh_uid, gh_name, gh_avatar_url)
        user_object = UserSchema().dump(user)
        session['user'] = user_object
        return user_object
    else:
        return redirect('/api/unauthorized/')
