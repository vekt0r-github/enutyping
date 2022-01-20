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
        Score(user_id=1234, beatmap_id=727, score=123),
        Score(user_id=4321, beatmap_id=727, score=72727),
        Score(user_id=4321, beatmap_id=727, score=72726),
        Score(user_id=4321, beatmap_id=727, score=72725),
    ]

    db_session.bulk_save_objects(objects)
    db_session.commit()


test_map_content = '''L,0,きんいろモザイク　きんいろなんです　深夜　んなってっしゃじょん
S,500,きんいろもざいく
S,5000,きん
S,6000,いろ
S,7000,なん
S,8000,です
S,9000,しん
S,10000,や
S,15000,んなってっしゃじょん
E,20000
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

flos_content = '''L,4138,Daphne, Ficus, Iris, Maackia
S,4646,daph
S,4900,ne
S,5663,fi
S,5917,cus
S,6680,i
S,6934,ris
S,7697,maac
S,7951,ki
S,8078,a
L,8205,Lythrum, Myrica, Sabia, Flos
S,8714,lyth
S,9095,rum
S,9731,my
S,9858,ri
S,9985,ca
S,10748,sa
S,11002,bi
S,11129,a
S,11765,flos
L,12273,
L,28544,拝啓 僕の願いよ 未来よ
S,29053,はい
S,29307,けい
S,30070,ぼく
S,30324,の
S,30960,ね
S,31087,がい
S,31341,よ
S,31976,み
S,32104,らい
S,32358,よ
L,33629,絶え間無い後悔よ
S,33884,た
S,34137,え
S,34392,ま
S,34646,ない
S,35154,こう
S,35663,か
S,35917,い
S,36171,よ
L,36680,体感八度五分の夢は
S,37188,たい
S,37443,かん
S,38205,は
S,38332,ち
S,38460,ど
S,39222,ご
S,39349,ぶん
S,39476,の
S,40239,ゆ
S,40366,め
S,40493,は
L,41765,軈て散ってしまった
S,42019,や
S,42273,が
S,42527,て
S,42782,ち
S,43290,って
S,43799,しま
S,44307,った
L,44815,Daphne, Ficus, Iris, Maackia
S,45324,daph
S,45578,ne
S,46341,fi
S,46595,cus
S,47358,i
S,47612,ris
S,48375,maac
S,48629,ki
S,48756,a
L,48883,Lythrum, Myrica, Sabia
S,49392,lyth
S,49646,rum
S,50409,my
S,50536,ri
S,50663,ca
S,51426,sa
S,51680,bi
S,51807,a
L,52951,Thymus, Ribes, Abelia, Sedum
S,53460,thy
S,53714,mus
S,54477,ri
S,54731,bes
S,55494,a
S,55621,be
S,55748,li
S,55875,a
S,56511,se
S,56765,dum
L,57019,Felicia, Ochna, Lychnis
S,57528,fe
S,57654,li
S,57782,ci
S,57909,a
S,58545,och
S,58799,na
S,59562,lych
S,59816,nis
L,61087,再啓 君の想いは 憂いは
S,61595,さい
S,61849,けい
S,62612,き
S,62739,み
S,62866,の
S,63502,お
S,63629,もい
S,63883,は
S,64518,う
S,64646,れい
S,64900,は
L,66171,回る感情論は
S,66426,め
S,66679,ぐ
S,66934,る
S,67188,かん
S,67696,じょう
S,68205,ろん
S,68713,は
L,69222,半径八十五分の世界に
S,69730,はん
S,69985,けい
S,70747,は
S,70875,ち
S,71002,じゅう
S,71764,ご
S,71891,ぶん
S,72018,の
S,72654,せ
S,72781,かい
S,73036,に
L,74307,囚われた儘
S,74561,と
S,74815,ら
S,75069,わ
S,75324,れ
S,75832,た
S,76341,ま
S,76849,ま
L,77358,本音を挿し罅割れた今日を
S,77358,ほん
S,77866,ね
S,78121,を
S,78311,さし
S,78883,ひ
S,79137,び
S,79646,わ
S,79900,れ
S,80155,た
S,80345,きょう
S,80726,を
L,81426,溢れた一切に
S,81934,あ
S,82188,ふ
S,82443,れ
S,82697,た
S,83205,い
S,83714,っさ
S,83968,い
S,84222,に
L,85493,薪を焼べて風に乗せて
S,85493,ま
S,85875,き
S,86256,を
S,86510,く
S,86892,べ
S,87273,て
S,87527,か
S,87909,ぜ
S,88290,に
S,88544,の
S,88926,せ
S,89307,て
L,89561,錆びた空を彩る
S,89561,さ
S,89943,び
S,90324,た
S,90578,そ
S,90960,ら
S,91341,を
S,91595,い
S,91976,ろ
S,92358,ど
S,92612,る
L,93629,燻んだ日々を丁に寧に
S,93883,く
S,94138,すん
S,94646,だ
S,94900,ひ
S,95155,び
S,95409,を
S,95663,てい
S,96171,に
S,96680,ねい
S,97188,に
L,97697,飾った花は直ぐに枯れてく
S,97951,か
S,98205,ざ
S,98714,った
S,98968,は
S,99222,な
S,99477,は
S,99731,す
S,99985,ぐ
S,100239,に
S,100493,か
S,101002,れ
S,101256,て
S,101510,く
L,101765,愚鈍な僕は夢から覚めて
S,102019,ぐ
S,102273,どん
S,102782,な
S,103036,ぼ
S,103290,く
S,103544,は
S,103799,ゆ
S,104053,め
S,104307,か
S,104561,ら
S,104816,さ
S,105070,め
S,105324,て
L,105832,縋った意味も無い無い無いな
S,106087,す
S,106341,が
S,106849,った
S,107104,い
S,107358,み
S,107612,も
S,107866,な
S,108121,い
S,108375,な
S,108629,い
S,108883,な
S,109138,い
S,109392,な
L,109900,
L,126171,君が僕にくれた声も色も
S,126426,き
S,126680,み
S,126934,が
S,127061,ぼ
S,127315,く
S,127443,に
S,127697,く
S,127951,れ
S,128205,た
S,128714,こ
S,128968,え
S,129222,も
S,129731,い
S,129985,ろ
S,130239,も
L,131256,揺るぎない愛情も
S,131510,ゆ
S,131765,る
S,132019,ぎ
S,132273,ない
S,132782,あい
S,133290,じょう
S,133799,も
L,134307,二人きりの空に光った星も
S,134561,ふ
S,134815,た
S,135070,り
S,135197,き
S,135451,り
S,135578,の
S,135832,そ
S,136087,ら
S,136341,に
S,136595,ひ
S,136849,か
S,137358,った
S,137866,ほ
S,138121,し
S,138375,も
L,139392,疾うに散ってしまった
S,139646,と
S,139900,う
S,140154,に
S,140409,ち
S,140917,って
S,141330,し
S,141426,ま
S,141934,った
L,142443,難儀の末のモノクロの疲弊に
S,142443,なん
S,142951,ぎ
S,143206,の
S,143396,すえ
S,143777,の
S,143968,も
S,144222,の
S,144731,く
S,144985,ろ
S,145240,の
S,145430,ひへい
S,145811,に
L,146510,季節は色褪せて
S,147019,き
S,147273,せ
S,147527,つ
S,147782,は
S,148036,い
S,148290,ろ
S,148799,あ
S,149053,せ
S,149307,て
L,150578,熱を帯びて鈍く膿んで
S,150578,ね
S,150960,つ
S,151341,を
S,151595,お
S,151977,び
S,152358,て
S,152612,に
S,152994,ぶ
S,153375,く
S,153629,う
S,154011,ん
S,154392,で
L,154646,擦れた街に零れる
S,154646,す
S,155028,れ
S,155409,た
S,155663,ま
S,156045,ち
S,156426,に
S,156680,こ
S,157061,ぼ
S,157443,れ
S,157697,る
L,158714,荒んだ日々を丁に寧に
S,158968,す
S,159223,さん
S,159731,だ
S,159985,ひ
S,160240,び
S,160494,を
S,160748,てい
S,161256,に
S,161765,ねい
S,162273,に
L,162782,辿った先に花が咲く筈
S,163036,た
S,163290,ど
S,163799,った
S,164053,さ
S,164307,き
S,164562,に
S,164816,は
S,165070,な
S,165324,が
S,165578,さ
S,166087,く
S,166341,は
S,166595,ず
L,166850,利口な君は夢を見た儘
S,167104,り
S,167358,こう
S,167867,な
S,168121,き
S,168375,み
S,168629,は
S,168884,ゆ
S,169138,め
S,169392,を
S,169646,み
S,169901,た
S,170155,ま
S,170409,ま
L,170917,悟った振りで水を注いだ
S,171172,さ
S,171426,と
S,171934,った
S,172189,ふ
S,172443,り
S,172697,で
S,172951,み
S,173206,ず
S,173460,を
S,173714,そ
S,173968,そ
S,174223,い
S,174477,だ
L,174985,
L,191256,木漏れ日の中に
S,191765,こ
S,192019,も
S,192273,れ
S,192654,び
S,193036,の
S,193544,な
S,193799,か
S,194053,に
L,195324,柔らかく咲いた花は
S,195832,や
S,196087,わ
S,196341,ら
S,196722,か
S,197104,く
S,197612,さ
S,197866,い
S,198121,た
S,198629,は
S,198883,な
S,199137,は
L,199392,雲の上で 違う星で
S,199392,く
S,199774,も
S,200155,の
S,200409,う
S,200791,え
S,201172,で
S,201426,ち
S,201808,が
S,202189,う
S,202443,ほ
S,202825,し
S,203206,で
L,203460,夢の先で揺れてる
S,203460,ゆ
S,203842,め
S,204223,の
S,204477,さ
S,204859,き
S,205240,で
S,205494,ゆ
S,205875,れ
S,206257,て
S,206511,る
L,207527,燻んだ日々を丁に寧に
S,207781,く
S,208036,すん
S,208544,だ
S,208798,ひ
S,209053,び
S,209307,を
S,209561,てい
S,210069,に
S,210578,ねい
S,211086,に
L,211595,飾った花は直ぐに枯れてく
S,211849,か
S,212103,ざ
S,212612,った
S,212866,は
S,213120,な
S,213375,は
S,213629,す
S,213883,ぐ
S,214137,に
S,214391,か
S,214900,れ
S,215154,て
S,215408,く
L,215663,愚鈍な僕は夢から覚めて
S,215917,ぐ
S,216171,どん
S,216680,な
S,216934,ぼ
S,217188,く
S,217442,は
S,217697,ゆ
S,217951,め
S,218205,か
S,218459,ら
S,218714,さ
S,218968,め
S,219222,て
L,219730,縋った意味も無い無い無いな
S,219985,す
S,220239,が
S,220747,った
S,221002,い
S,221256,み
S,221510,も
S,221764,な
S,222019,い
S,222273,な
S,222527,い
S,222781,な
S,223036,い
S,223290,な
L,223799,不毛な日々を丁に寧に
S,224053,ふ
S,224308,もう
S,224816,な
S,225070,ひ
S,225325,び
S,225579,を
S,225833,てい
S,226341,に
S,226850,ねい
S,227358,に
L,227867,綴った紙に花を描いた
S,228121,つ
S,228375,づ
S,228884,った
S,229138,か
S,229392,み
S,229647,に
S,229901,は
S,230155,な
S,230409,を
S,230663,え
S,231172,が
S,231426,い
S,231680,た
L,231935,不遇な僕ら夢に敗れて
S,232189,ふ
S,232443,ぐう
S,232952,な
S,233206,ぼ
S,233460,く
S,233714,ら
S,233969,ゆ
S,234223,め
S,234477,に
S,234731,や
S,234986,ぶ
S,235240,れ
S,235494,て
L,236002,誓った筈も無かった事にした
S,236257,ち
S,236511,か
S,237019,った
S,237274,は
S,237528,ず
S,237782,も
S,238036,な
S,238291,か
S,238799,った
S,239053,こ
S,239308,と
S,239562,に
S,239815,し
S,240070,た
L,240578,Daphne, Ficus, Iris, Maackia
S,240578,daph
S,240832,ne
S,241595,fi
S,241849,cus
S,242612,i
S,242866,ris
S,243629,maac
S,243883,ki
S,244010,a
L,244137,Lythrum, Myrica, Sabia
S,244646,lyth
S,244900,rum
S,245663,my
S,245790,ri
S,245917,ca
S,246680,sa
S,246934,bi
S,247061,a
L,248205,Thymus, Ribes, Abelia, Sedum
S,248714,thy
S,248968,mus
S,249731,ri
S,249985,bes
S,250748,a
S,250875,be
S,251002,li
S,251129,a
S,251765,se
S,252019,dum
L,252273,Felicia, Ochna, Lychnis
S,252782,fe
S,252908,li
S,253036,ci
S,253163,a
S,253799,och
S,254053,na
S,254816,lych
S,255070,nis
L,256341,Daphne, Ficus, Iris, Maackia
S,256850,daph
S,257104,ne
S,257867,fi
S,258121,cus
S,258884,i
S,259138,ris
S,259901,maac
S,260155,ki
S,260282,a
L,260409,Lythrum, Myrica, Sabia
S,260918,lyth
S,261172,rum
S,261935,my
S,262062,ri
S,262189,ca
S,262952,sa
S,263206,bi
S,263333,a
L,264477,Thymus, Ribes, Abelia, Sedum
S,264986,thy
S,265240,mus
S,266003,ri
S,266257,bes
S,267020,a
S,267147,be
S,267274,li
S,267401,a
S,268037,se
S,268291,dum
L,268544,Felicia, Ochna, Lychnis, Flos
S,269054,fe
S,269180,li
S,269308,ci
S,269435,a
S,270071,och
S,270325,na
S,271088,lych
S,271342,nis
S,272104,flos
E,272612'''


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
