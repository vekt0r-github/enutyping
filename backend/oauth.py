import os 
import requests
# Github OAuth

GITHUB_OAUTH_CLIENT_ID = os.environ.get('TODO1', "806baa3f78769475057c")
GITHUB_OAUTH_CLIENT_SECRET = os.environ.get('TODO2', "797d30d7ace90515f776fb5874547935026d2e4c")
OAUTH_SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", "supersekritsfasdfsaflksjfajlksjfsk")

REQUEST_AUTH_URL = 'https://github.com/login/oauth/authorize'
REQUEST_TOKEN_URL = 'https://github.com/login/oauth/access_token'

# TODO: have base_url instead of localhost

class OAuth():
    def __init__(self, redirect_uri = 'http://localhost:5000/login/authorized'):
        self.redirect_uri = redirect_uri

    def request_url(self):
        params = {
            'client_id': GITHUB_OAUTH_CLIENT_ID,
            'redirect_uri': self.redirect_uri,
            'state': OAUTH_SECRET_KEY,
        }
        p = requests.Request('GET', REQUEST_AUTH_URL, params = params).prepare()
        return p.url
    
    def authorize(self, code):
        data = {
            'client_id': GITHUB_OAUTH_CLIENT_ID,
            'client_secret': GITHUB_OAUTH_CLIENT_SECRET,
            'code': code,
        }
        headers = {
            'Accept': 'application/json'
        }
        res = requests.post(REQUEST_TOKEN_URL, headers = headers, data = data)
        return res.json()
