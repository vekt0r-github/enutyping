## general stuff and App.tsx

title = enuTyping
  
error-mobile-layout-header = Device Not Supported
error-mobile-layout = { title } is only for wide computers. sorry!

loading = Loading...
not-found = This page could not be found. <LinkTo>Go Home</LinkTo>

editing-prefix = {"Editing: "}
map-display-default-artist = <artist>
map-display-default-title = <title>
map-display-default-diffname = <identifier>
map-display = { $artist } - { $title } [{ $diffname }]
invalid-access-map = This beatmap doesn't exist, or you don't have the permissions to edit it. <LinkTo>Create a new one?</LinkTo>
invalid-access-mapset = This collection doesn't exist, or you don't have the permissions to edit it. <LinkTo>Create a new one?</LinkTo>

## component-specific stuff

confirm-delete = Delete
confirm-cancel = Cancel

diffs-mapset-owner =
  Collection created by <LinkTo>{ $owner }</LinkTo>
diffs-header = Select Beatmap:
diffs-map-display =
  <Line>{ $title }</Line>
  <Line>by { $artist }</Line>
  <Line>[{ $diffname }] ({ $kpm } kpm)</Line>

editor-header = { editing-prefix }{ map-display }
editor-change-diffname = Change identifier:
editor-map-edit-metadata = Edit Metadata
editor-map-delete = Delete Beatmap
editor-warning-map-delete = 
  <Line>Are you sure you want to delete this beatmap:</Line>
  <BigLine>{ map-display }?</BigLine>
  <Line>This action is permanent and cannot be undone.</Line>
editor-testing-mode = Testing Mode
editor-timing-bpm = {"Current BPM: "}
editor-timing-bpm-none = None—press 'T' to set a timing point
editor-unsaved = *Unsaved Changes* (Ctrl+S to save)
editor-shortcut-play-pause = Play/Pause
editor-shortcut-scroll = Navigate the timeline
editor-shortcut-save = Save beatmap
editor-shortcut-timing-add = Place a timing point
editor-shortcut-timing-add-desc = Make sure your timing is correct! Look up the BPM of your song, navigate to the first downbeat, and place your timing point.
editor-shortcut-timing-remove = Delete last timing point
editor-shortcut-beat-snap = Change beat snap divisor
editor-shortcut-beat-snap-desc = Each white tick in the timeline is one beat, and the colored lines are subdivisions.
editor-shortcut-line-add = Place a new line
editor-shortcut-line-add-desc = Place a line whenever a line of lyrics starts, and enter the lyrics in the textbox. You can join or split lines to make the beatmap more readable!
editor-shortcut-line-remove = Delete the previous line
editor-shortcut-syllable-add = Place a new syllable
editor-shortcut-syllable-add-desc = Write the exact kana or letters you want the player to type at the current time.
editor-shortcut-syllable-remove = Delete the previous syllable
editor-shortcut-scroll-jump = Navigate to nearest lines/syllables
editor-shortcut-end-set = Set beatmap's end time
editor-shortcut-end-set-desc = This is when your last line ends. Don't forget to set this!
editor-shortcut-testing-enter = Enter "{ editor-testing-mode }"
editor-shortcut-testing-enter-desc = This is where you can test your map from any point, to see how hard it is!
editor-shortcut-testing-exit = Exit { editor-testing-mode }

form-map-header = Map Metadata:
form-map-ytid = YouTube Video ID
form-map-ytid-desc = 11 character video code
form-map-artist = Artist
form-map-title = Title
form-map-diffname = Identifier
form-map-diffname-desc =
  {"[TODO]"} something short to disambiguate
  among multiple maps of the same song
form-map-romanized = Romanized { $field }
form-map-submit-create = Create Map and Continue
form-map-submit-update = Update Map Metadata
form-mapset-header = Collection Information:
form-mapset-name = Collection Title
form-mapset-desc = Description
form-mapset-icon = Icon Source
form-mapset-icon-desc = An image link, to serve as your collection's icon in the menu.
form-mapset-submit-create = Create Collection and Continue
form-warning-metadata = Make sure your metadata is correct! You can still change it after you've started mapping.

game-leaderboard-header = Leaderboard
game-mods-header = Map Modifications
game-mods-speed = Map Playback Speed: 
game-mods-speed-desc = Use this to change how fast the map is (slower is easier, faster is harder)!
game-stats-correct-keys = Correct Keystrokes
game-stats-incorrect-keys = Incorrect Keystrokes
game-stats-kana-typed = Kana Typed
game-stats-kana-missed = Kana Missed
game-stats-key-acc = Key Acc
game-stats-kana-acc = Kana Acc
game-stats-score = Score
game-stats-kpm = KPM
game-map-stats-kpm = Map KPM
game-map-stats-line-kpm = Line KPM
game-submitting = Submitting score...
game-start-warning-login = Warning: You are not logged in, and your score will not be submitted.
game-start-message-header = Press Space to play
game-start-message-subheader = Press Esc to exit during a game
game-start-offset = {"Set map offset (ms): "}
game-start-offset-desc = (Put negative offset if you think syllables are late; positive if you think they're early)
game-results-header = RESULTS
game-results-score = Final Score: { $score }

home-title = Type your favorite songs as you listen
home-subtitle = the second bestest free-to-win rhythm game
home-try-now = Try Now!

login-header = Login

map-info = Map Info
map-info-title = Title
map-info-artist = Artist
map-info-kpm = Average KPM
map-info-source = Source Video
map-info-source-link = Link (YouTube)
map-info-source-no-link = Source link not set
mapset-info = Collection Info
mapset-info-name = Name
mapset-info-owner = Owner
mapset-info-kpm = Avg. Collection KPM

menu-header = Song Select
menu-search-placeholder = Search for a collection:
menu-editor-header = My Collections
menu-map-new = Create New Beatmap in Collection
menu-map-display = { $title } // { $artist } [{ $diffname }]
menu-mapset-new = Create New Collection
menu-mapset-delete = Delete Collection
menu-mapset-owner = created by { $owner }
menu-mapset-mapcount = { $mapCount ->
  [one] 1 map
  *[other] { $mapCount } maps
}
menu-mapset-kpm = Average keys/min: { $kpm }
menu-warning-mapset-delete = 
  <Line>Are you sure you want to delete this collection:</Line>
  <BigLine>{ $name }?</BigLine>
  <Line>{ $mapCount ->
    [0] No maps
    [one] 1 map
    *[other] All { $mapCount } maps
  } will be deleted.</Line>
  <Line>This action is permanent and cannot be undone.</Line>

menu-label-filter = Filter: KPM <
menu-label-sort = Sort by:
menu-label-reverse = Reverse?
menu-sorting-date = Date Created
menu-sorting-length = Average Length
menu-sorting-name = Collection Name
menu-sorting-owner = Creator

navbar-play-create = <play>play</play><create>create</create>
navbar-login = sign in
navbar-profile = my profile
navbar-settings = settings
navbar-logout = sign out

settings = Settings
settings-success = Success!
settings-error-name-blank = We don't like blank names! Pick something else.
settings-error-name-bad = This looks like a default name. Pick something else.
settings-error-name-taken = Username was taken! Please choose another one.
settings-section-general = General
settings-section-gameplay = Gameplay
settings-section-account = Account
settings-name-change = Change Username: 
settings-name-change-prompt = Requested Name: 
settings-site-language = Site Language: 
settings-metadata-localization = Metadata Localization: 
settings-global-offset = Global Offset: 
settings-kana-input = Kana Input: 
settings-polygraphic-kana-input = Polygraphic Kana Input: 
settings-metadata-localization-true = Display all song metadata in their Romanized versions (i.e. with the English alphabet)
settings-metadata-localization-false = Display all song metadata in their original languages
settings-global-offset-desc = If you feel that every map you play is consistently late or early, use this to apply an offset to every map automatically.
settings-kana-input-desc = For each of the following kana, choose how you want it to be romanized.
settings-polygraphic-kana-input-true = Enable individual typing of polygraphs
settings-polygraphic-kana-input-false = Disable individual typing of polygraphs
settings-polygraphic-kana-input-desc = Choose whether you want to be able to type polygraphic kana such as しゃ and っぷ by typing each kana individually. For example, with this setting turned on, you can type しゃ as \"sha\" or \"shixya\".

user-info-join-date = Join Date
user-info-key-acc = Overall Key Accuracy
user-info-kana-acc = Overall Kana Accuracy
user-info-play-count = Play Count
user-info-total-score = Total Score

userpage-section-scores = Recent Scores
userpage-no-scores = No recent plays for this player!
userpage-score-map-display = <emph>{ $artist } - { $title }</emph> [{ $diffname }]
userpage-score-score = <emph>{ $score }</emph> points (<emph>{ $speed }x</emph> speed)
userpage-score-date = Played at { $date }
userpage-score-acc = <emph>{ $keyAcc }%</emph> key, <emph>{ $kanaAcc }%</emph> kana