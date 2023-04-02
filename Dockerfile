FROM node:16-alpine as frontend
WORKDIR /app
# ENV PATH /app/node_modules/.bin:$PATH
COPY frontend/package.json frontend/package-lock.json ./
COPY ./frontend ./
# RUN npm install
# RUN npm run build

RUN npm install --production && npm cache clean --force
RUN npm run build

FROM python:3.9
WORKDIR /app

COPY ./backend ./backend
RUN pip install --no-cache-dir -r ./backend/requirements.txt
ENV FLASK_ENV production

EXPOSE 5000

COPY --from=frontend /app/build ./frontend/build

# RUN gunicorn --chdir backend wsgi:app

CMD ["gunicorn", "-b", ":5000", "--chdir", "backend", "wsgi:app"]