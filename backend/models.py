from sqlalchemy import Column, Integer, String, UnicodeText, ForeignKey
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
    artist = Column(String(50))
    title = Column(String(50))
    source = Column(String(100))
    content = Column(UnicodeText)
    scores = relationship('Score', back_populates='beatmap')

    def __init__(self, artist, title, source, content, id = None):
        self.artist = artist
        self.title = title
        self.source = source
        self.content = content
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
        Beatmap(id=727, artist='Nanahira', \
                        title='Nanahira singing from the window to a fucking van', \
                        source='https://www.youtube.com/watch?v=9USxPiJzdv0', \
                        content=content),
        Beatmap(id=1337, artist='Nekomata Okayu', \
                         title='flos', \
                         source='https://www.youtube.com/watch?v=4muYzftomAE', \
                         content=flos_content),
        Score(user_id=1234, beatmap_id=727, score=727),
        Score(user_id=4321, beatmap_id=727, score=72727),
    ]

    db_session.bulk_save_objects(objects)
    db_session.commit()

content = '''L,500,ぷるーん
S,500,ぷ
S,544,るーん
L,2617,わらび餅　ぷり
S,2617,わ
S,3014,ら
S,3279,び
S,5264,も
S,5419,ち
S,5838,ぷ
S,5970,り
L,6566,わらび餅　ぷるぷるぷるぷるぷるとした
S,6566,わ
S,6764,ら
S,6985,び
S,7205,も
S,7536,ち
S,8852,ぷ
S,8911,る
S,9102,ぷ
S,9168,る
S,9367,ぷ
S,9433,る
S,9632,ぷ
S,9698,る
S,9985,ぷ
S,10051,る
S,10360,とし
S,10558,た
L,11330,冷たい
S,11330,つ
S,11463,め
S,11595,たい
L,12786,わらび餅はいかがですか
S,12786,わ
S,12897,ら
S,13007,び
S,13117,も
S,13227,ち
S,13338,は
S,13779,い
S,13889,か
S,13999,が
S,14110,です
S,14286,か
L,14794,ぷりぷりぷりぷりぷりぷりーん
S,14794,ぷ
S,14838,り
S,15014,ぷ
S,15058,り
S,15235,ぷ
S,15279,り
S,15433,ぷ
S,15477,り
S,15654,ぷ
S,15698,り
S,15985,ぷ
S,16029,りーん
E,18014'''

flos_content = '''L,4646,daphne
S,4646,daph
S,4900,ne
L,5663,ficus
S,5663,fi
S,5917,cus
L,6680,iris
S,6680,i
S,6934,ris
L,7697,maackia
S,7697,maac
S,7951,ki
S,8078,a
L,8714,lythrum
S,8714,lyth
S,9095,rum
L,9731,myrica
S,9731,my
S,9858,ri
S,9985,ca
L,10748,sabia
S,10748,sa
S,11002,bi
S,11129,a
L,11765,flos
S,11765,flos
E,13000'''

if __name__ == '__main__':
    init_db()