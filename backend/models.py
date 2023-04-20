from sqlalchemy import Column, Integer, String, Float, UnicodeText, ForeignKey
from sqlalchemy.orm import deferred, relationship
from time import time
from database import Base

class User(Base):
    __tablename__ = 'users'
    # https://stackoverflow.com/questions/23157411/using-text-as-a-primary-key-in-sqlite-table-bad
    id = Column(String(69), primary_key=True)
    name = Column(String(50), unique=True)
    avatar_url = Column(String(100))
    scores = relationship('Score', lazy="dynamic", order_by="desc(Score.id)", back_populates='user')
    beatmapsets = relationship('Beatmapset', back_populates='owner')
    join_time = Column(Integer())
    key_accuracy = Column(Float())
    kana_accuracy = Column(Float())
    total_score = Column(Integer())
    play_count = Column(Integer())

    def __init__(self, id, name, avatar_url):
        self.id = id
        self.name = name
        self.avatar_url = avatar_url
        self.join_time = time()
        self.key_accuracy = 1
        self.kana_accuracy = 1
        self.total_score = 0
        self.play_count = 0

class Beatmap(Base):
    __tablename__ = 'beatmaps'
    id = Column(Integer, primary_key=True)
    beatmapset_id = Column(Integer, ForeignKey('beatmapsets.id'))
    diffname = Column(String(50))
    scores = relationship('Score', back_populates='beatmap')
    content = deferred(Column(UnicodeText))

    beatmapset = relationship('Beatmapset', back_populates='beatmaps')
    kpm = Column(Float)

    def __init__(self, beatmapset_id, diffname, content, kpm, id = None):
        self.beatmapset_id = beatmapset_id
        self.diffname = diffname
        self.content = content
        self.kpm = kpm
        self.id = id

class Beatmapset(Base):
    __tablename__ = 'beatmapsets'
    id = Column(Integer, primary_key=True)
    owner_id = Column(String(69), ForeignKey('users.id'))
    artist = Column(String(100))
    title = Column(String(100))
    artist_original = Column(String(100))
    title_original = Column(String(100))
    yt_id = Column(String(69))
    preview_point = Column(Integer)
    duration = Column(Integer)

    owner = relationship('User', back_populates='beatmapsets')
    beatmaps = relationship('Beatmap', back_populates='beatmapset', cascade="all, delete, delete-orphan")

class Score(Base):
    __tablename__ = 'scores'
    id = Column(Integer, primary_key=True)
    user_id = Column(String(69), ForeignKey('users.id'))
    beatmap_id = Column(Integer, ForeignKey('beatmaps.id'))

    score = Column(Integer)
    key_accuracy = Column(Float)
    kana_accuracy = Column(Float)
    time_unix = Column(Integer)
    speed_modification = Column(Float)

    user = relationship('User', back_populates='scores')
    beatmap = relationship('Beatmap', back_populates='scores')

    def __init__(self, user_id, beatmap_id, score, key_accuracy, kana_accuracy, time_unix, speed_modification, id = None):
        self.user_id = user_id
        self.beatmap_id = beatmap_id
        self.score = score
        self.key_accuracy = key_accuracy
        self.kana_accuracy = kana_accuracy
        self.time_unix = time_unix
        self.id = id
        self.speed_modification = speed_modification

def init_db():
    from database import db_session, engine

    Base.metadata.create_all(bind=engine)

    objects = [
        User(id=1234, name='ppfarmer', avatar_url='https://avatars.githubusercontent.com/u/34809632'),
        User(id=4321, name='songenjoyer', avatar_url='https://avatars.githubusercontent.com/u/1700346'),
        User(id="8484892osu", name='vekt0r', avatar_url='https://a.ppy.sh/8484892?1594621695.jpeg'),
        # TODO: Add durations to the beatmapsets, choose what unit you want but make it consistent
        Beatmapset(id=727, 
            owner_id=1234,
            artist='Nanahira', \
            title='Nanahira singing from the window to a fucking van', \
            artist_original='ななひら', \
            title_original='Nanahira singing from the window to a fucking van', \
            yt_id='9USxPiJzdv0', \
            preview_point=0, \
            duration=78000),
        Beatmap(id=727, \
            beatmapset_id=727, \
            diffname="sampai_'s ear damage", \
            content=content,
            kpm=401),
        Beatmapset(id=1337, 
            owner_id="8484892osu",
            artist='Nekomata Okayu', \
            title='flos', \
            artist_original='猫又おかゆ', \
            title_original='flos', \
            yt_id='4muYzftomAE', \
            preview_point=0, \
            duration=280000),
        Beatmap(id=1337, \
            beatmapset_id=1337, \
            diffname="Lythrum", \
            content=flos_content,
            kpm=273),
#        Beatmapset(id=272, 
#            owner_id=4321,
#            artist='YOASOBI', \
#            title='Yoru ni Kakeru', \
#            artist_original='YOASOBI', \
#            title_original='夜に駆ける', \
#            yt_id='xtfXl7TZTac', \
#            preview_point=0, \
#            duration=261000),
#        Beatmap(id=272, \
#            beatmapset_id=272, \
#            diffname="夜にこｃｋ", \
#            content=yorunicontent,
#            kpm=381),
#        Beatmap(id=2727, \
#            beatmapset_id=272, \
#            diffname="dev map ん～", \
#            content=test_map_content,
#            kpm=189),
        Beatmapset(id=1338, 
            owner_id="8484892osu",
            artist='Minato Aqua & Nekomata Okayu', \
            title='Turing Love', \
            artist_original='湊あくあ&猫又おかゆ', \
            title_original='チューリングラブ', \
            yt_id='0OtNQEpSeIA', \
            preview_point=0, \
            duration=220000),
        Beatmap(id=2729, \
            beatmapset_id=1338, \
            diffname="Complete", \
            content=turing_content,
            kpm=427),
        Beatmapset(id=6789, \
            owner_id="1234", \
            artist='Bo en', \
            title='My Time', \
            artist_original='Bo en', \
            title_original='My Time', \
            yt_id='erzgjfU271g', \
            preview_point=0, \
            duration=105000),
        Beatmap(id=2730, \
            beatmapset_id=6789, \
            diffname="sampai_'s Fun Time", \
            content=my_time_content,
            kpm=196),
        Beatmapset(id=7270, \
            owner_id="8484892osu", \
            artist='25-ji, Nightcord de. x Megurine Luka', \
            title='Kanadetomosusora', \
            artist_original='25時、ナイトコードで。 × 巡音ルカ ', \
            title_original='カナデトモスソラ', \
            yt_id='AICkt9OIFKA', \
            preview_point=0, \
            duration=151000),
        Beatmap(id=2731, \
            beatmapset_id=7270, \
            diffname="拒んだもの", \
            content=kanade_content,
            kpm=275),

        Score(user_id=1234, beatmap_id=727, key_accuracy=1.0, kana_accuracy=1.0, time_unix=time(), speed_modification=1.0, score=727),
        Score(user_id=1234, beatmap_id=727, key_accuracy=1.0, kana_accuracy=1.0, time_unix=time(), speed_modification=1.0, score=123),
        Score(user_id=4321, beatmap_id=727, key_accuracy=1.0, kana_accuracy=1.0, time_unix=time(), speed_modification=1.0, score=72727),
        Score(user_id=4321, beatmap_id=727, key_accuracy=1.0, kana_accuracy=1.0, time_unix=time(), speed_modification=1.0, score=72726),
        Score(user_id=4321, beatmap_id=727, key_accuracy=1.0, kana_accuracy=1.0, time_unix=time(), speed_modification=1.0, score=72725),
    ]

    db_session.bulk_save_objects(objects)
    db_session.commit()

my_time_content = '''ishpytoing file format v1

[TimingPoints]
380,199

[Lines]
L,380,Close
S,380,close
L,3094,Your eyes, you'll be here soon
S,3094,your
S,3998,eyes
S,4903,youll
S,5807,be
S,6712,here
S,7616,soon
L,10631,一二三四五分
S,10631,い
S,10782,ち
S,10933,に
S,11234,さん
S,12139,し
S,13043,ご
S,13948,ふー
S,14852,ん
L,17867,時々本当に寝たい
S,17867,と
S,18018,き
S,18169,ど
S,18320,き
S,18470,ほん
S,19375,とう
S,20279,に
S,21184,ね
S,22089,たい
L,25104,でもこの後できない
S,25104,で
S,25254,も
S,25405,こ
S,25556,の
S,25707,あ
S,26611,と
S,27516,で
S,28420,き
S,29325,ない
L,30229,おやすみ
S,30229,お
S,31134,や
S,32038,す
S,32943,み
L,33847,おやすみ
S,33847,お
S,34752,や
S,35656,す
S,36561,み
L,37465,おやすみ
S,37465,お
S,38370,や
S,39274,す
S,40179,み
L,41084,おやすみ
S,41084,お
S,41988,や
S,42893,すー
L,43797,おやすみ、おやすみ
S,43797,お
S,44099,や
S,44400,す
S,44702,み
S,45003,お
S,45606,や
S,45908,す
S,46058,み
L,46511,Close your eyes and you'll leave this dream
S,46511,close
S,46963,your
S,47415,eyes
S,47717,and
S,48018,youll
S,48320,leave
S,48772,this
S,49224,dream
L,51033,おやすみおやすみ
S,51033,お
S,51335,や
S,51636,す
S,51938,み
S,52239,お
S,52842,ya
S,53295,su
S,53747,mi
L,54199,I know that it's hard to do
S,54199,i
S,54651,know
S,54953,that
S,55254,its
S,55556,hard
S,56008,to
S,56460,do
L,57365,[Instrumental]
L,72742,おやすみおやすみ
S,72742,お
S,73043,や
S,73345,す
S,73646,み
S,73948,お
S,74551,や
S,74852,す
S,75003,み
L,75455,Close your eyes and you'll leave this dream
S,75455,close
S,75908,your
S,76360,eyes
S,76661,and
S,76963,youll
S,77264,leave
S,77717,this
S,78169,dream
L,79978,おやすみおやすみ
S,79978,お
S,80279,や
S,80581,す
S,80883,み
S,81184,お
S,81787,や
S,82239,す
S,82692,み
L,83144,I know that it's hard to do
S,83144,i
S,83596,know
S,83898,that
S,84199,its
S,84501,hard
S,84953,to
S,85405,do
E,85556
'''

test_map_content = '''ishpytoing file format v1

[TimingPoints]
1040,130

[Lines]
L,0,きんいろモザイク　きんいろなんです　深夜づぇ　てぃえぇぇぇぁぇぃぅぇぉぁぉ　んなってっしゃじょん
S,500,きんいろもざいく
S,4000,きん
S,5000,いろ
S,6000,なん
S,7000,です
S,8000,しん
S,9000,やづぇ
S,10000,てぃ
S,11000,えぇぇぇ
S,13000,ぁぇぃぅぇぉぁぉ
S,17000,んなってっしゃじょん
L,20000,ヵゕ
S,20000,ヵゕ
E,21000
'''

content = '''ishpytoing file format v1

[TimingPoints]
500,170

[Lines]
L,500,ぷるーん
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

flos_content = '''ishpytoing file format v1

[TimingPoints]
4138,118

[Lines]
L,4138,Daphne, Ficus, Iris, Maackia
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


yorunicontent = '''ishpytoing file format v1

[TimingPoints]
1040,130

[Lines]
L,0,沈むように溶けていくように
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

turing_content = '''ishpytoing file format v1

[TimingPoints]
1036,142

[Lines]
L,1036,
L,7797,湊あくあ&猫又おかゆ - チューリングラブ
L,20895,あー、恋の定義がわかんない
S,20895,あー
S,21318,こい
S,21529,の
S,21635,てい
S,21846,ぎ
S,22057,が
S,22163,わ
S,22268,かん
S,22480,ない
L,22797,まずスキって基準もわかんない
S,22797,ま
S,22902,ず
S,23008,す
S,23113,き
S,23325,って
S,23430,き
S,23536,じゅん
S,23747,も
S,23853,わ
S,23959,かん
S,24170,ない
L,24381,要は、恋してるときが恋らしい
S,24381,よう
S,24592,は
S,24698,こい
S,25015,して
S,25121,る
S,25226,と
S,25332,き
S,25437,が
S,25543,こ
S,25649,い
S,25754,ら
S,25860,しい
L,26177,客観？ 主観？ エビデンスプリーズ！
S,26177,か
S,26388,っかん
S,26705,しゅ
S,26811,かん
S,27022,え
S,27128,び
S,27233,でんす
S,27444,ぷ
S,27550,りーず
L,28078,愛は計算じゃ解けない
S,28078,あい
S,28395,は
S,28501,けい
S,28712,さん
S,28923,じゃ
S,29029,と
S,29135,け
S,29240,ない
L,29557,まず普通の計算も解けない
S,29557,ま
S,29663,ず
S,29768,ふ
S,29874,つう
S,30085,の
S,30191,けい
S,30402,さん
S,30613,も
S,30719,と
S,30825,け
S,30930,ない
L,31142,要は、そんな状態が愛らしい
S,31142,よう
S,31353,は
S,31459,そん
S,31670,な
S,31775,じょう
S,31987,たい
S,32198,が
S,32304,あい
S,32515,ら
S,32621,しい
L,32937,アイノウ？ ユーノウ？
S,32937,あい
S,33149,のう
S,33360,ゆー
S,33571,のう
L,33782,もう大抵の事象において
S,33782,もう
S,33994,たい
S,34205,てい
S,34416,の
S,34628,じ
S,34839,しょう
S,35050,に
S,35156,おい
S,35473,て
L,35684,QがあってAを出して解けるのに
S,35684,q
S,35895,が
S,36001,あ
S,36318,って
S,36529,a
S,36740,を
S,36846,だ
S,37163,して
S,37268,と
S,37374,け
S,37585,る
S,37797,の
S,38008,に
L,38219,勘違って間違って
S,38219,かん
S,38430,ち
S,38536,が
S,38853,って
S,39064,ま
S,39275,ち
S,39381,が
S,39698,って
L,39909,解のないこの気持ちはなんだろう
S,39909,かい
S,40121,の
S,40226,ない
S,40543,こ
S,40649,の
S,40754,き
S,40966,も
S,41177,ち
S,41388,は
S,41599,なん
S,42233,だ
S,42444,ろう
L,42867,検証 is 不明瞭
S,42867,けん
S,43290,しょう
S,43712,is
S,44029,ふ
S,44135,めい
S,44557,りょう
L,44980,DAZING!!
S,45191,da
S,45402,zing
L,45825,モーションは相対性にステイ
S,45825,もー
S,46142,しょん
S,46459,は
S,46670,そう
S,46881,たい
S,47092,せい
S,47304,に
S,47515,ステイ
E,48360'''

kanade_content = '''ishpytoing file format v1

[TimingPoints]
8000,79
89076,79

[Lines]
L,8000,想い出　辿るたびに　ひどく
S,8380,お
S,8759,も
S,9139,い
S,9519,で
S,10278,た
S,10658,ど
S,11038,る
S,11418,た
S,11797,び
S,12177,に
S,12937,ひ
S,13316,ど
S,13696,く
L,14076,押し潰されそうになる　けど
S,14456,お
S,14835,し
S,15215,つ
S,15595,ぶ
S,15975,さ
S,16354,れ
S,16734,そう
S,17494,に
S,17873,な
S,18253,る
S,19392,け
S,19772,ど
L,20152,逃げ込む　場所なんてないからさ
S,20532,に
S,20911,げ
S,21291,こ
S,21671,む
S,22430,ば
S,22810,しょ
S,23190,な
S,23570,ん
S,23949,て
S,24329,ない
S,25089,か
S,25468,ら
S,25848,さ
L,26228,繰り返す　自問自答　ああ。
S,26608,く
S,26987,り
S,27367,か
S,27747,えす
S,28506,じ
S,28886,もん
S,29646,じ
S,30025,と
S,30405,う
S,31544,あ
S,31924,あ
L,32304,いつもそうやって　すり減らしてって
S,33316,い
S,33443,つ
S,33696,も
S,33823,そう
S,34203,や
S,34582,って
S,36354,す
S,36481,り
S,36734,へ
S,36861,ら
S,37241,し
S,37620,て
S,38000,って
L,38380,気づいたら　何も見えなくなってた
S,39392,き
S,39519,づ
S,39772,い
S,39899,た
S,40278,ら
S,40658,なに
S,41038,も
S,41418,み
S,41797,え
S,42177,な
S,42557,く
S,42937,な
S,43696,って
S,44076,た
L,44456,わからないものが　つもり　つもる　まえに　ほら
S,44835,わ
S,45215,か
S,45595,ら
S,45975,な
S,46354,い
S,46734,も
S,47114,の
S,47494,が
S,47873,つ
S,48253,も
S,48633,り
S,49392,つ
S,49772,も
S,50152,る
S,50911,ま
S,51291,え
S,51671,に
S,52810,ほ
S,53190,ら
L,53570,
L,55848,拒んだもの多すぎて
S,56228,こ
S,56608,ばん
S,57367,だ
S,57747,も
S,58127,の
S,58506,おお
S,58886,す
S,59139,ぎ
S,59266,て
L,59646,見えないもの　ばっかみたいだ
S,60025,み
S,60405,え
S,60658,な
S,60785,い
S,61038,も
S,61165,の
S,61544,ば
S,61924,っか
S,62177,み
S,62304,たい
S,62684,だ
L,63063,ちょっと　触れようとして　みてもいいかな
S,63443,ちょ
S,63823,っと
S,64582,ふ
S,64962,れ
S,65342,よう
S,66101,と
S,66481,して
S,66734,み
S,66861,て
S,67114,も
S,67241,いい
S,67873,か
S,68000,な
L,68380,伝えたいよ　きっと無理か
S,68633,つ
S,68759,たえ
S,69519,たい
S,69899,よ
S,70278,き
S,70658,っと
S,71038,む
S,71291,り
S,71418,か
L,71797,もしれないけどどうか
S,72177,も
S,72557,し
S,72810,れ
S,72937,な
S,73190,い
S,73316,け
S,73696,ど
S,74076,どう
S,74456,か
L,74835,ねえもっと　ねえもっと　見たいよ
S,75215,ねえ
S,75595,も
S,75975,っと
S,76734,ねえ
S,77114,も
S,77494,っと
S,78253,み
S,78633,たい
S,79013,よ
L,79392,知らない世界　で見つけたイメージを
S,79772,し
S,80152,ら
S,80405,な
S,80532,い
S,80785,せ
S,80911,かい
S,81671,で
S,82051,み
S,82430,つ
S,82810,け
S,83190,た
S,83443,い
S,83570,めー
S,84203,じ
S,84329,を
L,84709,音にするから
S,85089,お
S,85342,と
S,85468,に
S,85848,す
S,86101,る
S,86481,か
S,86608,ら
L,89076,なにもないのに　なにかもとめて
S,89456,な
S,89835,に
S,90215,も
S,90595,な
S,90975,い
S,91354,の
S,91734,に
S,92494,な
S,92873,に
S,93253,か
S,93633,も
S,94013,と
S,94392,め
S,94772,て
L,95152,なにもないまま　あしたをとじた
S,95532,な
S,95911,に
S,96291,も
S,96671,な
S,97051,い
S,97430,ま
S,97810,ま
S,98570,あ
S,98949,し
S,99329,た
S,99709,を
S,100089,と
S,100468,じ
S,100848,た
L,101228,なにもないけど　なにもないから
S,101608,な
S,101987,に
S,102367,も
S,102747,な
S,103127,い
S,103506,け
S,103886,ど
S,104646,な
S,105025,に
S,105405,も
S,105785,な
S,106165,い
S,106544,か
S,106924,ら
L,107304,ここでみつけた　このメロディ
S,107684,こ
S,108063,こ
S,108443,で
S,108823,み
S,109203,つ
S,109582,け
S,109962,た
S,110722,こ
S,111101,の
S,111481,め
S,111861,ろ
S,112620,でぃ
E,113380
'''

if __name__ == '__main__':
    init_db()
