from sqlalchemy import Column, Integer, String, UnicodeText, ForeignKey
from sqlalchemy.orm import deferred, relationship

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
    yt_id = Column(String(100))
    content = deferred(Column(UnicodeText))
    scores = relationship('Score', back_populates='beatmap')

    def __init__(self, artist, title, yt_id, content, id = None):
        self.artist = artist
        self.title = title
        self.yt_id = yt_id
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
                        yt_id='9USxPiJzdv0', \
                        content=content),
        Beatmap(id=1337, artist='Nekomata Okayu', \
                         title='flos', \
                         yt_id='4muYzftomAE', \
                         content=flos_content),
        Beatmap(id=272, artist='YOASOBI', \
                         title='Yoru ni Kakeru', \
                         yt_id='xtfXl7TZTac', \
                         content=yorunicontent),
        Beatmap(id=2727, artist='idk', \
                         title='dev map', \
                         yt_id='xtfXl7TZTac', \
                         content=test_map_content),
        Score(user_id=1234, beatmap_id=727, score=727),
        Score(user_id=4321, beatmap_id=727, score=72727),
    ]

    db_session.bulk_save_objects(objects)
    db_session.commit()


test_map_content = '''L, 500,んなってっしゃじょん
S, 500,んなってっしゃじょん
E, 20000
'''

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


yorunicontent = '''L,0,沈むように溶けていくように
S,0,しずむようにとけてゆくように
L,8000,二人だけの空が広がる夜に
S,8000,ふたりだけのそらがひろがるように
L,31000,さよならだけだった
S,31000,さよならだけだった
L,33000,その一言で全てが分かった
S,33000,そのひとことですべてがわかった
L,37000,日が沈み出した空と君の姿
S,37000,ひがしずみだしたそらときみのすがた
L,41000,フェンス越しに重なっていた
S,41000,ふぇんすーごしにかさなっていた
L,45000,初めて会った日から
S,45000,はじめてあったひから
L,48000,僕の心の全てを奪った
S,48000,ぼくのこころのすべておうばった
L,52000,どこか儚い空気を纏う君は
S,52000,どこかはかないくうきおまとうきみわ
L,56000,寂しい目をしてたんだ
S,56000,さびしいめをしてたんだ
L,60000,いつだってチックタックと鳴る世界で何度だってさ
S,60000,いつだってちっくたっくとなるせかいでなんどだってさ
L,63000,触れる心無い言葉うるさい声に涙が零れそうでも
S,63000,ふれるこころないことばうるさいこえになみだがこぼれそうでも
L,68000,ありきたりな喜び
S,68000,ありきたりなよろこび
L,70000,きっと二人なら見つけられる
S,70000,きっとふたりならみつけられる
L,74000,騒がしい日々に笑えない君に
S,74000,さわがしいひびにわらえないきみに
L,78000,思い付く限り眩しい明日を
S,78000,おもいつくかぎりまぶしいあすを
L,82000,開けない夜に落ちてゆく前に
S,82000,あけないよるにおちてゆくまえに
L,86000,僕の手を掴んでほら
S,86000,ぼくのておつかんでほら
L,89000,忘れてしまいたくて閉じ込めた日々も
S,89000,わすれてしまいたくてとじこめたひびも
L,93000,抱きしめた温もりで溶かすから
S,93000,だきしめたぬくもりでとかすから
L,97000,怖くないよいつか日が昇るまで
S,97000,こわくないよいつかひがのぼるまで
L,101000,二人でいよう
S,101000,ふたりでいよう
L,117000,君にしか見えない
S,117000,きみにしかみえない
L,120000,何かを見つめる君が嫌いだ
S,120000,なにかおみつめるきみがきらいだ
L,124000,見惚れているかのような
S,124000,みとれているかのような
L,127000,恋するような
S,127000,こいするような
L,128000,そんな顔が嫌いだ
S,128000,そんあかおがきらいだ
L,132000,信じてたいけど信じれないこと
S,132000,しんじていたいけどしんじれないこと
L,134000,そんなのどうしたってきっと
S,134000,そんあのどうしたってきっと
L,136000,これからだっていくつもあって
S,136000,これからだっていくつもあって
L,137000,そのたんび怒って泣いていくの
S,137000,そのたんびおこってないていくの
L,139000,それでもきっといつかはきっと僕らはきっと
S,139000,それでもきっといつかわきっとぼくらわきっと
L,142000,分かり合えるさ信じてるよ
S,142000,わかりあえるーさしんじてるよ
L,160000,もう嫌だって疲れたんだって
S,160000,もういやだってつかれたんだって
L,162000,がむしゃらに差し伸べた僕の手を振り払う君
S,162000,がむしゃらにさしのべたぼくのておふりはらうきみ
L,168000,もう嫌だって疲れたよなんて
S,168000,もいやだってつかれたよなんて
L,170000,本当は僕も言いたいんだ
S,170000,ほんとうわぼくもいいたいんだ
L,174000,ほらまたチックタックと
S,174000,ほらまたちっくたっくと
L,176000,鳴る世界で何度だってさ
S,176000,なるせかいでなんどだってさ
L,177000,君の為に用意した言葉どれも届かない
S,177000,きみのためによおいしたことばどれもとどかない
L,181000,「終わりにしたい」だなんてさ
S,181000,「おわりにしたい」だなんてさ
L,183000,釣られて言葉にした時
S,183000,つられてことばにしたとき
L,185000,君は初めて笑った
S,185000,きみわはじめてわらった
L,191000,騒がしい日々に笑えなくなっていた
S,191000,さわがしいひびにわらえなくなっていた
L,194000,僕の目に映る君は綺麗だ
S,194000,ぼくのめにうつるきみわきれいだ
L,198000,開けない夜に溢れた涙も
S,198000,あけないよるにこぼれたなみだも
L,202000,君の笑顔に溶けていく
S,202000,きみのえがおにとけていく
L,207000,変わらない日々に泣いていた僕を
S,207000,かわらないひびにないていたぼくお
L,211000,君は優しく終わりへと誘う
S,211000,きみわやさしくおわりえとさしょう
L,215000,沈むように溶けていくように
S,215000,しずむようにとけてゆくように
L,218000,染み付いた霧が晴れる
S,218000,しみついたきりがはれる
L,221000,忘れてしまいたくて閉じ込めた日々に
S,221000,わすれてしまいたくてとじこめたひびに
L,226000,差し伸べてくれた君の手を取る
S,226000,さしのべてくれたきみのておとる
L,230000,涼しい風が空を泳ぐように今
S,230000,すずしいかぜがそらおおよぐようにいま
L,234000,吹き抜けていく
S,234000,ふきぬけていく
L,236000,繋いだ手を離さないでよ
S,236000,つないだておはなさないでよ
L,239000,二人今、夜に駆け出していく
S,239000,ふたりいまよるにかけだしていく
E,243000'''

if __name__ == '__main__':
    init_db()
