from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from database import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True)
    scores = relationship('Score', back_populates='user')

    def __init__(self, id, name):
        self.id = id
        self.name = name

class Beatmap(Base):
    __tablename__ = 'beatmaps'
    id = Column(Integer, primary_key=True)
    song_name = Column(String(50))
    scores = relationship('Score', back_populates='beatmap')

    def __init__(self, song_name, id = None):
        self.song_name = song_name
        self.id = id

class Score(Base):
    __tablename__ = 'scores'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    beatmap_id = Column(Integer, ForeignKey('beatmaps.id'))
    score = Column(Integer)

    user = relationship('User', back_populates='scores')
    beatmap = relationship('Beatmap', back_populates='scores')

    def __init__(self, user_id, beatmap_id, score, id = None):
        self.user_id = user_id
        self.beatmap_id = beatmap_id
        self.score = score
        self.id = id

def init_db():
    from database import db_session, engine

    Base.metadata.create_all(bind=engine)
    
    objects = [
        User(id=1234, name='ppfarmer'),
        User(id=4321, name='songenjoyer'),
        Beatmap(id=1, song_name='banger'),
        Score(user_id=1234, beatmap_id=1, score=727),
        Score(user_id=4321, beatmap_id=1, score=72727),
    ]

    db_session.bulk_save_objects(objects)
    db_session.commit()

if __name__ == '__main__':
    init_db()
