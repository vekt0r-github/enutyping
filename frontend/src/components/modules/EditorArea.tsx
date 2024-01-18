import React, { useState, useEffect, useRef, useContext } from "react";
import { Navigate, useSearchParams } from "react-router-dom";

import GameAreaDisplay from "@/components/modules/GameAreaDisplay";
import EditorTimeline from "@/components/modules/EditorTimeline";
import EditorScrollBar from "@/components/modules/EditorScrollBar";

import { getL10nFunc } from '@/providers/l10n';
import { Config, configContext } from '@/providers/config';

import { 
  User, Beatmap, LineData,
  GameStatus, GameState, getModCombo 
} from "@/utils/types";
import { 
  makeLineStateAt,
  makeSetFunc,
  timeToLineIndex, 
  GAME_FPS,
  timeToSyllableIndex,
  writeBeatmap,
  lastLineOrSyllableTime, 
  getVisualPosition,
  timeToTimingPointIndex,
  getTimeOfBeat,
  timeToBeatNumber,
} from '@/utils/beatmaputils';
import { updateStateOnLineEnd } from "@/utils/gameplayutils";

import styled from 'styled-components';
import '@/utils/styles.css';
import { Line, EditorTimelineBox } from '@/utils/styles';

type Props = {
  user: User | null,
  beatmap: Beatmap,
  lastSavedBeatmap: Beatmap,
  setContent: (content: string, saved?: boolean) => void,
  saveBeatmap: () => void,
};

enum EditingStatus {NOT, LINE, SYLLABLE, TIMING};
const {NOT, LINE, SYLLABLE, TIMING} = EditingStatus;

type EditingState = {
  status: EditingStatus,
  unsaved: boolean,
  time?: number,
  content?: string,
};

const EditorAreaContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const TimelineMessageBox = styled(EditorTimelineBox)`
  justify-content: center;
`;

const LineInput = styled.input`
  position: absolute;
  font-size: 1.5em;
  font-family: "Open Sans";
  box-sizing: border-box;
  width: 600px;
  text-align: center;
  top: 182px; // empirical; subject to change
`;

const SyllableInput = styled(LineInput).attrs<{pos: number}>(({pos}) =>({
  style: {
    left: `calc(${pos} * (100% - 2*var(--s)))`,
  },
}))<{pos: number}>`
  font-size: 1.125em;
  width: 60px;
  text-align: left;
  top: 66px; // empirical; subject to change
`;

const TimingDisplay = styled.div`
  position: absolute;
  font-size: 1.25em;
  top: 250px;
  left: 20px;
`;

const TimingInput = styled(LineInput)`
  font-size: 1em;
  width: 100px;
  text-align: left;
  left: 119px;
  top: -11px;
`;

const UnsavedWarning = styled(Line)`
  background-color: var(--clr-warn);
  color: var(--clr-grey);
  position: absolute;
  top: 300px;
`;

const initStatsState = () => ({
  hits: 0,
  misses: 0,
  kanaHits: 0,
  kanaMisses: 0,
  totalKana: 0,
  score: 0,
});

// for during playback
const makeStateAt = (lines: LineData[], config: Config, currTime?: number, status?: GameStatus) : GameState => ({
  status: status ?? GameStatus.PAUSED,
  offset: 0,
  currTime: currTime ?? 0, // maintained via timer independent of video
  lines: lines.map((lineData) => makeLineStateAt(currTime ?? 0, lineData, config, true)),
  stats: initStatsState(),
  keyLog: [],
});



const EditorArea = ({ user, beatmap, lastSavedBeatmap, setContent, saveBeatmap } : Props) => {
  const [searchParams] = useSearchParams();
  const copyOf = searchParams.get('copy');
  
  const config = useContext(configContext);
  const text = getL10nFunc();
  
  const {lines, timingPoints} = beatmap;
  const makeState = (currTime?: number, status?: GameStatus) => makeStateAt(lines as LineData[], config, currTime, status);
  const [gameState, setGameState] = useState<GameState>(makeState());
  const set = makeSetFunc(setGameState);
  const [seekingTo, setSeekingTo] = useState<number>();
  const [editingState, setEditingState] = useState<EditingState>({ status: NOT, unsaved: copyOf ? true : false });

  const {status, offset, currTime, stats} = gameState;
  const currIndex = (currTime !== undefined) ? timeToLineIndex(lines, currTime) : undefined; 
  const isEditing = [GameStatus.PAUSED, GameStatus.AUTOPLAYING].includes(status);
  const isTesting = status === GameStatus.PLAYING;
  const indexValid = (index?: number) => (index !== undefined) && (index > -1) && (index < lines.length);
  const [beatSnapDivisor, setBeatSnapDivisor] = useState<number>(4);
  const currTimingPoint = timingPoints.length ? 
    timingPoints[Math.max(timeToTimingPointIndex(timingPoints, currTime!) - 1, 0)]
    : null;
  const ttbn = (divisor: number, t: number, round = false) => timeToBeatNumber(currTimingPoint!, divisor, t, round);
  const gtob = (divisor: number, b: number) => getTimeOfBeat(currTimingPoint!, divisor, b);

  const startTest = () => {
    setGameState((oldState) => {
      const currIndex = timeToLineIndex(lines, oldState.currTime!);
      return makeState(
        indexValid(currIndex) ? lines[currIndex].startTime : oldState.currTime,
        GameStatus.PLAYING,
      );
    });
  }

  const stopTest = () => {
    setGameState((oldState) => ({ ...oldState,
      status: GameStatus.PAUSED,
      stats: initStatsState(),
    }));
  };

  const isOnLine = (time : number) => lines.map(line => line.startTime).includes(time) || beatmap.endTime === time;

  const isOnSyllable = (time : number) => 
    ([] as number[]).concat.apply([], lines.map(line => line.syllables.map(s => s.time))).includes(time);

  const isOnTimingPoint = (time: number) => time === currTimingPoint?.time;

  const isOnBeat = (divisor : number, time: number) => {
    const beatTime = gtob(divisor, ttbn(divisor, time));
    return Math.round(time) === Math.round(beatTime);
  }

  const deleteLastLineBefore = (time : number) => { // or endpoint if applicable
    const index = timeToLineIndex(lines, time);
    if (index === -1) { return; }
    const currLine : LineData | undefined = lines[index];
    const prevLine : LineData | undefined = lines[index - 1];
    if (index === lines.length) { beatmap.endTime = undefined; }
    else if (index > 0) {
      lines.splice(index, 1);
      prevLine.endTime = currLine.endTime;
      prevLine.syllables = prevLine.syllables.concat(currLine.syllables);
      // prevLine.lyric = prevLine.lyric.concat(currLine.lyric);
    } else {
      if (currLine.syllables.length) { return; }
      lines.splice(index, 1);
    }
    setContent(writeBeatmap(beatmap));
    setEditingState({ status: NOT, unsaved: true });
  }

  const deleteSyllable = (syllables : LineData['syllables'], sIndex : number) => {
    if (sIndex < 0 || sIndex >= syllables.length) { return; }
    syllables.splice(sIndex, 1);
    setContent(writeBeatmap(beatmap));
    setEditingState({ status: NOT, unsaved: true });
  }
  
  const deleteLastSyllableBefore = (time : number) => { // only works within current line
    const index = timeToLineIndex(lines, time);
    if (!indexValid(index)) { return; }
    const syllables = lines[index].syllables;
    const sIndex = timeToSyllableIndex(syllables, time);
    deleteSyllable(syllables, sIndex - 1);
  }

  const deleteNextSyllableAfter = (time : number) => { // only works within current line
    const index = timeToLineIndex(lines, time);
    if (!indexValid(index)) { return; }
    const syllables = lines[index].syllables;
    let sIndex = timeToSyllableIndex(syllables, time);
    if (isOnSyllable(time)) { sIndex--; }
    deleteSyllable(syllables, sIndex);
  }

  const deleteLastTimingPointBefore = (time : number) => {
    if (timingPoints.length <= 1) { return; }
    const index = timeToTimingPointIndex(timingPoints, time);
    timingPoints.splice(Math.max(index - 1, 0), 1);
    setContent(writeBeatmap(beatmap));
    setEditingState({ status: NOT, unsaved: true });
  }

  const writeFromEditingState = (editingState : EditingState) => {
    // if currTime coincides with a line/syllable, it will overwrite
    const time = editingState.time!;
    if (editingState.status === LINE) { // finish editing line
      const index = timeToLineIndex(lines, time);
      if (index === lines.length) { return; } // past end of map
      const currLine : LineData | undefined = lines[index];
      const nextLine : LineData | undefined = lines[index + 1];
      if (isOnLine(time)) {
        currLine.lyric = editingState.content!;
      } else {
        let syllables : LineData['syllables'] = [];
        if (currLine) { 
          currLine.endTime = time;
          let sIndex = timeToSyllableIndex(currLine.syllables, time);
          if (isOnSyllable(time)) { sIndex--; }
          syllables = currLine.syllables.splice(sIndex);
        }
        lines.splice(index + 1, 0, {
          startTime: time,
          endTime: currLine ? currLine.endTime :
            (nextLine ? nextLine.startTime : 
              (beatmap.endTime ?? beatmap.duration)),
          lyric: editingState.content!,
          syllables: syllables,
        });
      }
    } else if (editingState.status === SYLLABLE) { // finish editing syllable
      if (!editingState.content!.length) { return; }
      const index = timeToLineIndex(lines, time);
      if (!indexValid(index)) { return; }
      const syllables = lines[index].syllables;
      const sIndex = timeToSyllableIndex(syllables, time);
      if (isOnSyllable(time)) { 
        syllables[sIndex - 1].text = editingState.content!;
      } else {
        syllables.splice(sIndex, 0, {
          time: time,
          text: editingState.content!,
          kana: [], // don't care cuz about to pass it to file format
        });
      }
    } else { // finish editing timing point
      const bpm = parseFloat(editingState.content!);
      if (isNaN(bpm) || bpm > 3000) { return; }
      if (!timingPoints.length) {
        timingPoints.push({ time, bpm });
      } else {
        const tpIndex = timeToTimingPointIndex(timingPoints, time);
        if (isOnTimingPoint(time)) {
          timingPoints[tpIndex - 1].bpm = bpm;
        } else {
          timingPoints.splice(tpIndex, 0, {
            time: time,
            bpm: bpm,
          });
        }
      }
    }
    // submit changes to newly edited thing to file format
    setContent(writeBeatmap(beatmap));
  };

  /**
   * Editor controls documentation (to write up in a user-facing infobox):
   * ^ means implemented
   * -^ Space: play/pause
   * -^ Ctrl+Space: enter testing mode
   * -^ Ctrl+S: save
   * -^ T: place timing point
   * -^ U: delete last timing point
   * -^ Up/Down: snap to nearest beat
   * -^ Left/Right: snap to nearest beat division
   * -^ [/]: change beat snap divisor (2, 3, 4, 6, 8, 12, 16)
   * -^ Ctrl+Up/Down: snap to nearest line start/end
   * -^ Ctrl+Left/Right: snap to nearest syllable
   * -^ Enter: begin/finish editing a new syllable at current time (cancelled if current time changes)\
   *   - double click on a syllable: also snaps to it, and begins editing
   * -^ Ctrl+Enter: same but for a line
   * -^ E: place the ending position (maybe button only)
   * - P: place the preview point (maybe button only)
   * - Ctrl+X/C/V: what you think they do (when not editing)
   * -^ Backspace: delete previous syllable, timewise
   * -^ Ctrl+Backspace: same but for a line
   * -^ Delete: delete next syllable, timewise
   * -^ Esc: exit testing mode or go back
   */
  const onKeyPress = (e: KeyboardEvent) => {
    if ((editingState.status !== NOT) || 
      ((e.target as Element)?.tagName?.toLowerCase() == 'input' &&
      (e.target as HTMLInputElement)?.type?.toLowerCase() != 'range')) { // in a textbox or whatever
      if (!["Enter", "Escape", "KeyS"].includes(e.code)) { return; }
      if (editingState.status === NOT && ["Enter"].includes(e.code)) { return; }
    }
    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;
    const time = currTime!;
    let index = currIndex!;
    if (isEditing) { 
      if (e.code === "Space") { 
        e.preventDefault();
        e.stopPropagation();
        if (ctrl) { // enter testing mode
          startTest();
        } else { // play/pause
          set('status')((status === GameStatus.PAUSED) ? GameStatus.AUTOPLAYING : GameStatus.PAUSED);
        }
      } else if (e.code === "KeyT" && !ctrl) { // place timing point
        e.preventDefault();
        e.stopPropagation();
        const content = isOnTimingPoint(time) ? `${currTimingPoint!.bpm}` : "";
        const newEditingState = { status: TIMING, unsaved: true, time: time, content: content };
        writeFromEditingState(newEditingState);
        setEditingState(newEditingState);
      } else if (e.code === "KeyU" && !ctrl) { // delete last timing point
        e.preventDefault();
        e.stopPropagation();
        deleteLastTimingPointBefore(time);
      } else if (e.code === "KeyE" && !ctrl) { // place game end
        e.preventDefault();
        e.stopPropagation();
        if (editingState.status !== NOT) { return; }
        if (time <= lastLineOrSyllableTime(lines)) { return; }
        beatmap.endTime = time;
        setContent(writeBeatmap(beatmap));
        setEditingState({ status: NOT, unsaved: true });
      } else if (e.code === "Enter") {
        if (editingState.status === NOT) { // begin editing something
          if (ctrl) { // edit line
            if (index === lines.length) { return; }
            const content = indexValid(index) && isOnLine(time) ? lines[index].lyric : "";
            const newEditingState = { status: LINE, unsaved: true, time: time, content: "" };
            writeFromEditingState(newEditingState);
            setEditingState({...newEditingState, content: content});
          } else { // edit syllable
            if (!indexValid(index)) { return; }
            let content = "";
            if (isOnSyllable(time)) {
              const syllables = lines[index].syllables;
              const sIndex = timeToSyllableIndex(syllables, time);
              content = syllables[sIndex - 1].text;
            }
            const newEditingState = { status: SYLLABLE, unsaved: true, time: time, content: "" };
            writeFromEditingState(newEditingState);
            setEditingState({...newEditingState, content: content});
          }
        } else { // finish editing something
          writeFromEditingState(editingState);
          setEditingState({ status: NOT, unsaved: true });
          if (editingState.status === SYLLABLE && editingState.content) {
            // copied code to seek to next tick
            let beat = ttbn(beatSnapDivisor, time, true);
            let newTime = Math.min(Math.round(gtob(beatSnapDivisor, beat + 1)), beatmap.duration);
            setSeekingTo(newTime);
          }
        }
      } else if (e.code === "Backspace") { // delete the last something
        if (editingState.status !== NOT) { return; } // probably a mistake
        if (ctrl) {
          deleteLastLineBefore(time);
        } else {
          deleteLastSyllableBefore(time);
        }
      } else if (e.code === "Delete") { // delete the next something
        if (editingState.status !== NOT) { return; } // probably a mistake
        if (ctrl) {} else {
          deleteNextSyllableAfter(time);
        }
      } else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault();
        e.stopPropagation();
        const dir = e.code.substring(5,6).toLowerCase();
        if (currTimingPoint) { 
          if (ctrl) { // seek to lines/syllables
            if (dir === 'u') { // seek to next line
              if (indexValid(index)) { setSeekingTo(lines[index].endTime); }
              else if (index === -1 && lines[0]) { setSeekingTo(lines[0].startTime); }
            } else if (dir === 'd') { // seek to prev line
              if (isOnLine(time)) { index--; }
              if (indexValid(index)) { setSeekingTo(lines[index].startTime); }
              else if (index !== -1) { setSeekingTo(beatmap.endTime); }
            } else if (dir === 'l') { // seek to prev syllable
              if (isOnLine(time)) { index--; }
              if (indexValid(index)) {
                const syllables = lines[index].syllables;
                let sIndex = timeToSyllableIndex(syllables, time);
                if (isOnSyllable(time)) { sIndex--; } // how did it come to this
                if (sIndex > 0) { setSeekingTo(syllables[sIndex - 1].time); }
                else { setSeekingTo(lines[index].startTime); }
              } else if (index !== -1) {
                setSeekingTo(beatmap.endTime);
              }
            } else if (dir === 'r') { // seek to next syllable
              if (indexValid(index)) {
                const syllables = lines[index].syllables;
                let sIndex = timeToSyllableIndex(syllables, time);
                if (sIndex < syllables.length) { setSeekingTo(syllables[sIndex].time); }
                else { setSeekingTo(lines[index].endTime); }
              } else if (index === -1 && lines[0]) {
                setSeekingTo(lines[0].startTime);
              }
            }
          } else { // seek to beats
            let divisor = 1; // seek to beat
            if ('lr'.includes(dir)) { // seek to beat division
              divisor = beatSnapDivisor;
            }
            let beat = ttbn(divisor, time, true);
            if ('ld'.includes(dir)) { // seek "prev"
              let newTime = Math.max(Math.round(gtob(divisor, beat - 1)), 0);
              setSeekingTo(newTime);
            } else { // seek "next"
              let newTime = Math.min(Math.round(gtob(divisor, beat + 1)), beatmap.duration);
              setSeekingTo(newTime);
            }
          }
        } else { // no timing point -- seek by ms
          let ms = 1; 
          if ('ud'.includes(dir)) { ms = 5; }
          if (ctrl) { ms *= 10 }
          if ('ld'.includes(dir)) { // seek prev
            let newTime = Math.max(time - ms, 0);
            setSeekingTo(newTime);
          } else { // seek next
            let newTime = Math.min(time + ms, beatmap.duration);
            setSeekingTo(newTime);
          }
        }
      } else if (e.code === "KeyS" && ctrl) { // save map
        e.preventDefault();
        e.stopPropagation();
        if (editingState.status !== NOT) {
          writeFromEditingState(editingState);
        } 
        if (!beatmap) { return; }
        if (!beatmap.content.length || !beatmap.diffname.length) { return; }
        saveBeatmap();
        setEditingState({ status: NOT, unsaved: false });
      } else if (e.code.startsWith("Bracket") && !ctrl) { // adjust beat snap divisor
        e.preventDefault();
        e.stopPropagation();
        const DIVISORS = [2, 3, 4, 6, 8, 12, 16];
        const dIndex = DIVISORS.indexOf(beatSnapDivisor);
        if (e.code === "BracketLeft") {
          if (dIndex === 0) { return; }
          setBeatSnapDivisor(DIVISORS[dIndex - 1]);
        } else {
          if (dIndex === DIVISORS.length - 1) { return; }
          setBeatSnapDivisor(DIVISORS[dIndex + 1]);
        }
      }
    }
    if (e.code === "Escape") {
      if (isTesting) { stopTest(); } 
      else if (editingState.status !== NOT) {
        writeFromEditingState(editingState);
        setEditingState({ status: NOT, unsaved: true });
      } else if (!editingState.unsaved) {
        set('status')(GameStatus.GOBACK); 
      }
    }
  };

  useEffect(() => {
    // start playing-- status must change to PLAYING
    // will cancel playing if status changes to not those
    if (![GameStatus.PLAYING, GameStatus.AUTOPLAYING].includes(status)) { return; }
    const gameStartTime = new Date().getTime() - (currTime ?? 0); // resume at current time
    const intervalId = setInterval(() => {
      const currTime = new Date().getTime() - gameStartTime;
      if (currTime < beatmap.duration) {
        set('currTime')(currTime);
      } else {
        set('status')(GameStatus.PAUSED);
      }
    }, 1000 / GAME_FPS);
    return () => {
      clearInterval(intervalId);
    };
  }, [status, seekingTo]);

  useEffect(() => { // seeking
    if (seekingTo === undefined) { return; }
    if (seekingTo === currTime) {
      setSeekingTo(undefined);
    } else {
      set('currTime')(seekingTo);
    }
  }, [currTime, seekingTo]);

  useEffect(() => { // edit canceling
    if (editingState.status === NOT || editingState.time! === currTime) { return; }
    writeFromEditingState(editingState);
    setEditingState({ status: NOT, unsaved: true });
  }, [currTime, editingState]);

  useEffect(() => {
    if (currIndex === undefined) { return; }
    if (currIndex === lines.length) {
      // set('status')(GameStatus.PAUSED);
    } else if (currIndex > 0) {
      setGameState((state) => updateStateOnLineEnd(state, currIndex));
    }
  }, [currIndex]);
  
  useEffect(() => {
    document.addEventListener("keydown", onKeyPress);
    return () => {
      document.removeEventListener("keydown", onKeyPress);
    }
  }, [status, editingState, currTime, beatSnapDivisor, beatmap]); // may eventually depend on other things
  
  useEffect(() => { // refresh map content
    setGameState((oldGameState) => makeState(oldGameState.currTime));
  }, [beatmap.content]);

  if (status === GameStatus.GOBACK) {
    return <Navigate to={`/edit`} replace={true} />;
  }

  const displayGameState = (isEditing && currTime !== undefined) ? 
    makeState(currTime, status) : gameState;
  
  const onInputChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    const newEditingState = { ...editingState, content: e.target.value };
    writeFromEditingState(newEditingState);
    setEditingState((oldEditingState) => {
      return newEditingState;
    });
  }

  // usurping editingState.unsaved for now
  const saved = beatmap.diffname === lastSavedBeatmap.diffname && beatmap.content === lastSavedBeatmap.content;

  return (
    <EditorAreaContainer>
      {isEditing ? (
        <EditorTimeline 
          windowLength={4000}
          currTime={currTime ?? 0}
          lines={lines}
          timingPoints={timingPoints}
          endTime={beatmap.endTime}
          beatSnapDivisor={beatSnapDivisor}
        />
      ) : (
        <TimelineMessageBox>
          <Line size="1.25em" margin="0">{text(`editor-testing-mode`)}</Line>
        </TimelineMessageBox>
      )}
      <GameAreaDisplay
        user={user}
        beatmap={beatmap}
        gameState={displayGameState}
        setGameState={isTesting ? setGameState : () => {}}
				speed={1}
				setAvailableSpeeds={() => {}}
        modCombo={getModCombo(0)} // nomod for visuals/testing
      />
      {/* a few absolutely positioned components to overlay */}
      {editingState.status === EditingStatus.LINE ?
        <LineInput
          value={editingState.content} 
          onChange={onInputChange} 
          autoFocus={true}
        /> : null}
      {editingState.status === EditingStatus.SYLLABLE ?
        <SyllableInput 
          size={5}
          pos={getVisualPosition(currTime!, lines[currIndex!])}
          value={editingState.content}
          onChange={onInputChange}
          autoFocus={true}
        /> : null}
      <TimingDisplay>{text(`editor-timing-bpm`)}
        {editingState.status === EditingStatus.TIMING ?
          <TimingInput 
            size={5}
            value={editingState.content}
            onChange={onInputChange}
            autoFocus={true}
          /> : (currTimingPoint?.bpm ?? text(`editor-timing-bpm-none`))}
      </TimingDisplay>
      {!saved ? <UnsavedWarning>{text(`editor-unsaved`)}</UnsavedWarning> : null}
      {isEditing ? (
        <EditorScrollBar 
          currTime={currTime ?? 0}
          setCurrTime={setSeekingTo}
          lines={lines}
          timingPoints={timingPoints}
          endTime={beatmap.endTime}
          length={beatmap.duration}
        />
      ) : (
        <TimelineMessageBox>
          <Line size="1.25em" margin="0">{text(`editor-testing-mode`)}</Line>
        </TimelineMessageBox>
      )}
    </EditorAreaContainer>
  );
}

export default EditorArea;
