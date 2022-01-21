import os 
import requests

# Github OAuth
GITHUB_OAUTH_CLIENT_ID = os.environ.get('GITHUB_OAUTH_CLIENT_ID', "806baa3f78769475057c")
GITHUB_OAUTH_CLIENT_SECRET = os.environ.get('GITHUB_OAUTH_CLIENT_SECRET', "797d30d7ace90515f776fb5874547935026d2e4c")
GITHUB_REDIRECT_URL = os.environ.get('GITHUB_OAUTH_REDIRECT_URL', None)
GITHUB_REQUEST_AUTH_URL = 'https://github.com/login/oauth/authorize'
GITHUB_REQUEST_TOKEN_URL = 'https://github.com/login/oauth/access_token'

OAUTH_SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", "supersekritsfasdfsaflksjfajlksjfsk")

class OAuth():
    def __init__(self, client_id, client_secret, secret_key, auth_url, token_url, redirect_uri):
        self.client_id = client_id
        self.client_secret = client_secret
        self.secret_key = secret_key
        self.auth_url = auth_url
        self.token_url = token_url
        self.redirect_uri = redirect_uri

    def request_url(self):
        params = {
            'client_id': self.client_id,
            'state': self.secret_key,
        }
        if self.redirect_uri: params['redirect_uri'] = self.redirect_uri
        p = requests.Request('GET', self.auth_url, params = params).prepare()
        return p.url
    
    def authorize(self, code):
        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'code': code,
        }
        headers = {
            'Accept': 'application/json'
        }
        res = requests.post(self.token_url, headers = headers, data = data)
        return res.json()

github_oauth = OAuth(GITHUB_OAUTH_CLIENT_ID, \
                     GITHUB_OAUTH_CLIENT_SECRET, \
                     OAUTH_SECRET_KEY, \
                     GITHUB_REQUEST_AUTH_URL, \
                     GITHUB_REQUEST_TOKEN_URL, \
                     GITHUB_REDIRECT_URL)
