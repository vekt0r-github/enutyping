import os 
import requests
# Github OAuth

GITHUB_OAUTH_CLIENT_ID = os.environ.get('TODO1', "806baa3f78769475057c")
GITHUB_OAUTH_CLIENT_SECRET = os.environ.get('TODO2', "797d30d7ace90515f776fb5874547935026d2e4c")
OAUTH_SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", "supersekritsfasdfsaflksjfajlksjfsk")

REQUEST_AUTH_URL = 'https://github.com/login/oauth/authorize'
REQUEST_TOKEN_URL = 'https://github.com/login/oauth/access_token'

REDIRECT_URL = os.environ.get('OAUTH_REDIRECT_URL', 'http://localhost:8000/login')

# TODO: have base_url instead of localhost

class OAuth():
    def __init__(self, redirect_uri = REDIRECT_URL):
        self.redirect_uri = redirect_uri

    def request_url(self):
        params = {
            'client_id': GITHUB_OAUTH_CLIENT_ID,
            'state': OAUTH_SECRET_KEY,
        }
        if self.redirect_uri: params['redirect_uri'] = self.redirect_uri
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
