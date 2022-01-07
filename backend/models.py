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

    def __init__(self, song_name):
        self.song_name = song_name

class Score(Base):
    __tablename__ = 'scores'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    beatmap_id = Column(Integer, ForeignKey('beatmaps.id'))
    score = Column(Integer)

    user = relationship('User', back_populates='scores')
    beatmap = relationship('Beatmap', back_populates='scores')

    def __init__(self, user_id, beatmap_id, score):
        self.user_id = user_id
        self.beatmap_id = beatmap_id
        self.score = score
