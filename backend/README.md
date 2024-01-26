# Setup

1. Create a venv if you haven't already with `python -m venv env`. Skip if you already have one created.
2. Go into your venv with `source env/bin/activate`.
3. Install packages with `pip install -r requirements.txt`.
  - On Windows, this requires Microsoft C++ Build Tools to be installed: https://visualstudio.microsoft.com/visual-cpp-build-tools/
4. Set environment variables in a file `.env`. Format should be in `.env.example`.
5. Run `python models.py`, so it can initialize a database with some dummy variables
6. Remember to `deactivate` if you are in this virtual environment but working on something else.

# Running locally

1. Set the following environment variables.
  - `export FLASK_ENV=development`
2. Run with `flask run`

# Migrations and testing migrations

Currently using Alembic for migrations; to test a given one, you need:
- the git commit hashes for before and after changes
- the alembic hash of the given and/or previous migration
- backups of any meaningful local testing data (db will be wiped)

The steps are:
- git checkout commit hash for before this migration (and/or git stash your changes)
- delete `persistent/data.db` and run `python models.py` to remake the db
- alembic stamp the hash of the previous migration
- git checkout commit hash for after migration (and/or git stash pop your changes)
- alembic upgrade +1, and if that succeeded, test that the data migrated the way you want!

note: when writing a migration that involves data, use this method: https://stackoverflow.com/a/24623979

Make sure to update the bottom section of `models.py` to be consistent with your new schema!

# Deploying

1. Be sure to run `npm run build` in frontend to build our React app.
2. Set the following environment variables to your desired values:
  - `export GITHUB_OAUTH_CLIENT_ID=foo`
  - `export GITHUB_OAUTH_CLIENT_SECRET=bar`
3. Optional environment variables:
  - Custom redirect url: `GITHUB_OAUTH_REDIRECT_URL`
4. Run using gunicorn
  - `gunicorn wsgi:app`
5. Serve behind reverse proxy if you want :)
