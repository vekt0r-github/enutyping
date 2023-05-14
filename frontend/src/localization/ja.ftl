## general stuff and App.tsx

title = enuTyping

error-mobile-layout-header = デバイス非対応
error-mobile-layout = 申し訳ありませんが、{ title }はデスクトップサイトだけでプレイできます。

loading = ローディング中...
not-found = このページは見つかりませんでした。<LinkTo>ホームページへ</LinkTo>

editing-prefix = 編集中：
to-play = プレイで見る
to-editor = 編集する

map-display-default-artist = <作家名>
map-display-default-title = <曲名>
map-display-default-diffname = <識別名>
map-display = { $artist } - { $title } [{ $diffname }]

invalid-access-map = このビートマップは存在しません。あるいは、編集の権限を持っていません。<LinkTo>新しいのを作りましょうか。</LinkTo>
invalid-access-mapset = このコレクションは存在しません。あるいは、編集の権限を持っていません。<LinkTo>新しいのを作りましょうか。</LinkTo>

## component-specific stuff

confirm-delete = 消す
confirm-cancel = キャンセル

copy-map-button = コピーする
copy-map-header = コピー先のコレクション選択
copy-map-cancel = キャンセル
copy-map-confirm-dialog =
  <Line>このビートマップを以下のコレクション：</Line>
  <BigLine>{ $name }</BigLine>
  <Line>へコピーしても宜しいでしょうか。</Line>
copy-map-select = はい
copy-map-back = いいえ

diffs-mapset-owner =
  コレクションの作者：<LinkTo>{ $owner }</LinkTo>
diffs-header = 「{ $name }」のビートマップ
diffs-map-display =
  <Line>{ $title }</Line>
  <Line>作家：{ $artist }</Line>
  <Line>[{ $diffname }] ({ $kpm } kpm)</Line>
diffs-section-actions = コレクションのアクション

editor-header = { editing-prefix }{ map-display }
editor-section-actions = ビートマップのアクション
editor-map-edit-metadata = メタデータ
editor-map-delete = 削除
editor-warning-map-delete = 
  <Line>以下のビートマップを削除しても宜しいでしょうか。</Line>
  <BigLine>{ map-display }</BigLine>
  <Line>削除すれば、元に戻すことはできません。</Line>
editor-testing-mode = テスティング中
editor-timing-bpm = 現在のBPM：
editor-timing-bpm-none = 未設定—「T」を押したら、タイミングポイントを配置できます。
editor-unsaved = *未保存変更* (Ctrl+Sで保存する)
editor-shortcut-header = エディターの使い方
editor-shortcut-play-pause = 再生・一時停止
editor-shortcut-scroll = 拍子を追ってタイムラインを移動する
editor-shortcut-save = ビートマップを保存する
editor-shortcut-timing-add = タイミングポイントを配置する
editor-shortcut-timing-add-desc = タイミングの正しさに気をつけてください。曲のBPMを調べて、最初の下拍に移動して、タイミングポイントを置きます。
editor-shortcut-timing-remove = 直前のタイミングポイントを削除する
editor-shortcut-beat-snap = ビートスナップ間隔を変わる
editor-shortcut-beat-snap-desc = タイムラインの白い短い線は一拍を表して、ほかの色の短い線は拍の一部を表しています。
editor-shortcut-line-add = ここで新しいラインを始める
editor-shortcut-line-add-desc = 
  歌詞のそれぞれの行が始まる瞬間に、ラインを置いて、テキストボックスにその歌詞の行を漢字を使って書いてください。
  ラインは、完璧に歌詞の行を従う必要はありません。
### You can join or split lines to make the beatmap more readable!
editor-shortcut-line-remove = 直前のラインを削除する
editor-shortcut-syllable-add = ここで新しいシラブルを置く
editor-shortcut-syllable-add-desc = 曲のそれぞれの音節に、プレーヤーに入力させたい仮名や文字を書きます。
editor-shortcut-syllable-remove = 直前のシラブルを削除する
editor-shortcut-scroll-jump = ラインとシラブルを追って移動する
editor-shortcut-end-set = ビートマップの終了時間を設定する
editor-shortcut-end-set-desc = 終了時間は最後のラインが終わる瞬間です。この設定を忘れないで下さい。
editor-shortcut-testing-enter = テスティングモードに入る
editor-shortcut-testing-enter-desc = これでビートマップを途中から、プレイしているように再生できます。
editor-shortcut-testing-exit = テスティングモードを終了する

form-map-header = ビートマップメタデータ：
form-map-ytid = YouTubeの動画ID
form-map-ytid-desc = URLの末尾にある11文字のコードです。
form-map-artist = 作家名
form-map-title = 曲名
form-map-diffname = 識別名
form-map-diffname-desc =
  何でもいいですが、同じ曲でビートマップを幾つかバージョンを作れば、これで区別できるようにしてください。
form-map-romanized = ローマ字の{ $field }
form-map-submit-create = ビートマップを作成する
form-map-submit-update = メタデータを更新する
form-mapset-header = コレクションメタデータ：
form-mapset-name = コレクション名
form-mapset-desc = 記述
form-mapset-icon = アイコンのリンク
form-mapset-icon-desc = メニューでのアイコンとして、画像リンクを入れてください。
form-mapset-submit-create = コレクションを作成する
form-mapset-submit-update = コレクションを更新する
form-warning-metadata = 入力内容を確認してください。しかし、このデータは全部後で変更できます。

game-leaderboard-header = リーダーボード
game-leaderboard-score = { $score }分（{ $speed }x{ $mods }）
game-mods-header = モディフィケーション
game-mods-multiplier = 現在のスコア倍率
game-mods-speed = ゲームプレイ速度
game-mods-speed-desc = これで動画の再生速度を変わって、難しさを調整できます。
game-mods-hidden = HD（消えるシラブル）
game-mods-hidden-desc = HDを付けたら、シラブルがタイプすべき時間前に消えるから、難しさが上がります。
game-stats-correct-keys = 正確な打鍵
game-stats-incorrect-keys = 不正確な打鍵
game-stats-kana-typed = タイプできた仮名
game-stats-kana-missed = 欠測した仮名
game-stats-key-acc = 打鍵正確率
game-stats-kana-acc = 仮名完成率
game-stats-score = スコア
game-stats-kpm = KPM
game-map-stats-kpm = マップKPM
game-map-stats-line-kpm = ラインKPM
game-submitting = スコアを記録中...
game-start-warning-login = 警告：あなたはログインしていないため、プレイしてもスコアは記録されません。
game-start-message-header = Spaceを押したらスタート！
game-start-message-subheader = ゲーム中ではEscで終了できます。
game-start-offset = オフセット(ms)：
game-start-offset-desc = （ビートマップのタイミングは音楽に対して遅かったら、負数を入れます。早かったら、正数を入れます。）
game-results-header = リザルト
game-results-score = ファイナルスコア：{ $score }

home-title = 好きな歌を聴きながら、歌詞をタイプする！
home-subtitle = 無料で、osu!に次いで最高のリズムゲーム
home-try-now = ゲームへ
  
login-header = ログイン

map-info = ビートマップ情報
map-info-title = 曲名
map-info-artist = 作家名
map-info-diffname = 識別名
map-info-kpm = マップKPM
map-info-source = 動画リンク
map-info-source-link = YouTube
map-info-source-no-link = 未設定
mapset-info = コレクション情報
mapset-info-name = コレクション名
mapset-info-owner = 作者
mapset-info-kpm = 平均KPM

menu-header = ビートマップリスト
menu-search-placeholder = コレクションを検索して…
menu-editor-header = 自分のビートマップ
menu-map-new = 新しいビートマップ
menu-map-new-diff = コレクションに新しいビートマップ
menu-map-display = { $title } // { $artist } [{ $diffname }]
menu-mapset-new = 新しいコレクション
menu-mapset-delete = コレクション削除
menu-mapset-owner = 作者：{ $owner }
menu-mapset-mapcount = マップ数：{ $mapCount }
menu-mapset-kpm = 平均KPM：{ $kpm }
menu-warning-mapset-delete = 
  <Line>以下のコレクションを削除しても宜しいでしょうか。</Line>
  <BigLine>{ $name }</BigLine>
  <Line>コレクションにあるビートマップ（{ $mapCount }）は全部削除されます。</Line>
  <Line>削除すれば、元に戻すことはできません。</Line>

menu-label-filter = KPM上限：
menu-label-sort = ソート順選択：
menu-label-reverse = リバース
menu-sorting-date = 作成順
menu-sorting-length = 長さ順
menu-sorting-name = コレクション名順
menu-sorting-owner = 作者名順

navbar-play-create = <play>プレイ</play><create>クリエート</create>
navbar-login = ログイン
navbar-profile = プロフィール
navbar-settings = 設定
navbar-logout = ログアウト

settings = 設定
settings-success = 成功です
settings-error-name-blank = 空白文字のユーザー名はいけません。他のユーザー名を選んでください。
settings-error-name-bad = これは他のユーザーのデフォルトユーザー名になるかもしれません。他のユーザー名を選んでください。
settings-error-name-taken = このユーザー名は使われています。他のユーザー名を選んでください。
settings-section-general = 一般
settings-section-gameplay = ゲームプレイ
settings-section-account = アカウント
settings-name-change = ユーザー名変更：
settings-name-change-prompt = 新しいユーザー名：
settings-site-language = 言語：
settings-metadata-localization = メタデータローカリゼーション：
settings-metadata-localization-true = 曲名と作家名をローマ字で表示する
settings-metadata-localization-false = 曲名と作家名を元言語で表示する
settings-global-offset = 全体オフセット：
settings-global-offset-desc = それぞれのビートマップのタイミングが全部早い、それとも全部遅いと思ったら、ここでタイミングオフセットを付けられます。
settings-keyboard-layout = キーボードレイアウト:
settings-keyboard-layout-kana = 言語入力
settings-keyboard-layout-romaji = ローマ字入力
settings-kana-input = 仮名のローマ字入力
settings-kana-input-desc =
  以下の仮名のローマ字入力の表示方を選んでください。
  この設定は、ローマ字入力だけに影響があります。
settings-polygraphic-kana-input = 拗音と促音の入力: 
settings-polygraphic-kana-input-desc =
  「しゃ」や「っぷ」をタイプする時に、二字の仮名を一々に入力する可能性です。
  例えば、「一々の入力も認める」を選択したら、「しゃ」をタイプする時に、「sha」だけでなく、「shixya」の入力も許されます。
  この設定は、ローマ字入力だけに影響があります。
settings-polygraphic-kana-input-true = 拗音と促音の一々の入力も認める
settings-polygraphic-kana-input-false = 拗音と促音の複合入力だけを認める

user-info-join-date = 入会日
user-info-key-acc = 平均打鍵正確率
user-info-kana-acc = 平均仮名完成率
user-info-play-count = プレイ回数
user-info-total-score = トータルスコア

userpage-section-scores = 最近稼働
userpage-no-scores = 最近のスコアはありません。
userpage-score-map-display = <emph>{ $artist } - { $title }</emph> [{ $diffname }]
userpage-score-score = スコア <emph>{ $score }</emph> (速度 <emph>{ $speed }x</emph>、<emph>{ $mods }</emph>)
userpage-score-date = 達成日 { $date }
userpage-score-acc = 打鍵 <emph>{ $keyAcc }%</emph>、仮名 <emph>{ $kanaAcc }%</emph>