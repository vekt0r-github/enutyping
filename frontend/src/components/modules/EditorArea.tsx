import React, { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";

import GameAreaDisplay from "@/components/modules/GameAreaDisplay";
import EditorTimeline from "@/components/modules/EditorTimeline";
import EditorScrollBar from "@/components/modules/EditorScrollBar";

import { post } from '@/utils/functions';
import { 
  User, Beatmap, LineData, Config,
  GameStatus, GameState 
} from "@/utils/types";
import { 
  makeLineStateAt,
  makeSetFunc,
  timeToLineIndex, 
  updateStatsOnKeyPress, 
  updateStatsOnLineEnd,
  GAME_FPS,
  timeToSyllableIndex,
  writeBeatmap,
  processBeatmap, 
} from '@/utils/beatmaputils';

import styled from 'styled-components';
import '@/utils/styles.css';
import { Line, EditorTimelineBox } from '@/utils/styles';

type Props = {
  user: User | null,
  beatmap: Beatmap,
  setContent: (content: string) => void,
  config: Config,
};

enum EditingStatus {NOT, LINE, SYLLABLE};
const {NOT, LINE, SYLLABLE} = EditingStatus;

type EditingState = {
  status: EditingStatus,
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
  box-sizing: border-box;
  top: 150px; // empirical; subject to change
`;

const SyllableInput = styled(LineInput)`
  font-size: 1.125em;
  top: 80px; // empirical; subject to change
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
  lines: lines.map((lineData) => makeLineStateAt(currTime ?? 0, lineData, config)),
  stats: initStatsState(),
});

const EditorArea = ({ user, beatmap, setContent, config } : Props) => {
  const lines = beatmap.lines;
  const makeState = (currTime?: number, status?: GameStatus) => makeStateAt(lines as LineData[], config, currTime, status);
  const [gameState, setGameState] = useState<GameState>(makeState());
  const set = makeSetFunc(setGameState);
  const [seekingTo, setSeekingTo] = useState<number>();
  const [editingState, setEditingState] = useState<EditingState>({ status: NOT });

  // from iframe API; in seconds, rounded? maybe
  // maybe need later but idk
  // const [duration, setDuration] = useState<number>(Infinity);

  const {status, offset, currTime, stats} = gameState;
  const currIndex = (currTime !== undefined) ? timeToLineIndex(lines, currTime) : undefined; 
  const isEditing = [GameStatus.PAUSED, GameStatus.AUTOPLAYING].includes(status);
  const isTesting = status === GameStatus.PLAYING;
  const indexValid = (index?: number) => (index !== undefined) && (index > -1) && (index < lines.length);
  
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

  const deleteLastLineBefore = (time : number) => { // or endpoint if applicable
    const index = timeToLineIndex(lines, time);
    if (index === -1) { return; }
    const currLine : LineData | undefined = lines[index];
    const prevLine : LineData | undefined = lines[index - 1];
    if (index === lines.length) { beatmap.endTime = undefined; }
    else {
      lines.splice(index, 1);
      prevLine.endTime = currLine.endTime;
      prevLine.syllables = prevLine.syllables.concat(currLine.syllables);
      prevLine.lyric = prevLine.lyric.concat(currLine.lyric);
    }
    setContent(writeBeatmap(beatmap));
  }
  
  const deleteLastSyllableBefore = (time : number) => { // only works within current line
    const index = timeToLineIndex(lines, time);
    if (!indexValid(index)) { return; }
    const syllables = lines[index].syllables;
    const sIndex = timeToSyllableIndex(syllables, time);
    if (sIndex === 0) { return; }
    syllables.splice(sIndex - 1, 1);
    setContent(writeBeatmap(beatmap));
  }

  const writeFromEditingState = (editingState : EditingState) => {
    // if currTime coincides with a line/syllable, it will overwrite
    const time = editingState.time!;
    if (editingState.status === LINE) { // finish editing line
      if (isOnLine(time)) { deleteLastLineBefore(time); }
      const index = timeToLineIndex(lines, time);
      if (index === lines.length) { return; } // past end of map
      const currLine : LineData | undefined = lines[index];
      const nextLine : LineData | undefined = lines[index + 1];
      let syllables : LineData['syllables'] = [];
      if (currLine) { 
        currLine.endTime = time;
        syllables = currLine.syllables.splice(timeToSyllableIndex(currLine.syllables, time));
      }
      lines.splice(index + 1, 0, {
        startTime: time,
        endTime: currLine ? currLine.endTime :
          (nextLine ? nextLine.startTime : 
            (beatmap.endTime ?? beatmap.beatmapset.duration)),
        lyric: editingState.content!,
        syllables: syllables,
      });
    } else { // finish editing syllable
      if (isOnSyllable(time)) { deleteLastSyllableBefore(time); }
      const index = timeToLineIndex(lines, time);
      if (!indexValid(index)) { return; }
      const syllables = lines[index].syllables;
      const sIndex = timeToSyllableIndex(syllables, time);
      syllables.splice(sIndex, 0, {
        time: time,
        text: editingState.content!,
        kana: [], // don't care cuz about to pass it to file format
      });
    }
    // submit changes to newly edited thing to file format
    console.log("HOLY SHIT")
    setContent(writeBeatmap(beatmap));
  }

  /**
   * Editor controls documentation (to write up in a user-facing infobox):
   * -^ Space: play/pause
   * -^ Ctrl+Space: enter testing mode
   * - Up/Down: snap to nearest beat
   * - Left/Right: snap to nearest beat division
   * - Ctrl+[/]: change beat snap divisor (2, 3, 4, 6, 8, 12, 16)
   * - Ctrl+Up/Down: snap to nearest line start/end
   * - Ctrl+Left/Right: snap to nearest syllable
   * -^ Enter: begin/finish editing a new syllable at current time (cancelled if current time changes)
   *   - while editing: there's some kind of input where you type in
   *   - double click on a syllable: also snaps to it, but does not begin editing
   * -^ Ctrl+Enter: same but for a line
   * - Ctrl+Shift+Enter: place the ending position (maybe button only)
   * - Ctrl+Shift+P: place the preview point (maybe button only)
   * -^ Backspace: delete previous syllable, timewise
   * -^ Ctrl+Backspace: same but for a line
   * -^ Esc: exit testing mode or go back
   */
  const onKeyPress = (e: KeyboardEvent) => {
    if (e.repeat) { return; }
    const ctrl = e.ctrlKey || e.metaKey;
    if (isEditing) { 
      if (e.code === "Space") { 
        e.preventDefault();
        e.stopPropagation();
        if (ctrl) { // enter testing mode
          startTest();
        } else { // play/pause
          set('status', (status === GameStatus.PAUSED) ? GameStatus.AUTOPLAYING : GameStatus.PAUSED);
        }
      } else if (e.code === "Enter") {
        if (editingState.status === NOT) { // begin editing something
          if (!ctrl && !indexValid(currIndex)) { return; }
          const newEditingState = { status: ctrl ? LINE : SYLLABLE, time: currTime, content: "" };
          writeFromEditingState(newEditingState);
          setEditingState(newEditingState);
        } else { // finish editing something
          writeFromEditingState(editingState);
          setEditingState({ status: NOT });
        }
      } else if (e.code === "Backspace") { // delete the last something
        if (editingState.status !== NOT) { return; } // probably a mistake
        if (ctrl) {
          currTime && deleteLastLineBefore(currTime);
        } else {
          currTime && deleteLastSyllableBefore(currTime);
        }
      }
    }
    if (e.code === "Escape") {
      if (isTesting) { stopTest(); } 
      if (isEditing) { set('status', GameStatus.GOBACK); }
    }
  };

  useEffect(() => {console.log(editingState)}, [editingState])

  useEffect(() => {
    // start playing-- status must change to PLAYING
    // will cancel playing if status changes to not those
    if (![GameStatus.PLAYING, GameStatus.AUTOPLAYING].includes(status)) { return; }
    const gameStartTime = new Date().getTime() - (currTime ?? 0); // resume at current time
    const intervalId = setInterval(() => {
      const currTime = new Date().getTime() - gameStartTime;
      if (currTime < beatmap.beatmapset.duration) {
        set('currTime', currTime);
      } else {
        set('status', GameStatus.PAUSED);
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
      set('currTime', seekingTo);
    }
  }, [currTime, seekingTo]);

  useEffect(() => { // edit canceling
    if (editingState.status === NOT || editingState.time! === currTime) { return; }
    writeFromEditingState(editingState);
    setEditingState({ status: NOT });
  }, [currTime, editingState]);

  useEffect(() => {
    if (currIndex === undefined) { return; }
    if (currIndex === lines.length) {
      // set('status', GameStatus.PAUSED);
    } else if (currIndex > 0) {
      set('stats', (oldStats) => updateStatsOnLineEnd(oldStats, lines[currIndex-1]));
    }
  }, [currIndex]);
  
  useEffect(() => {
    document.addEventListener("keydown", onKeyPress);
    return () => {
      document.removeEventListener("keydown", onKeyPress);
    }
  }, [status, editingState, currTime]); // may eventually depend on other things
  
  useEffect(() => { // refresh map content
    console.log("refr")
    setGameState((oldGameState) => makeState(oldGameState.currTime));
  }, [beatmap.content]);

  const keyCallback = (hit: number, miss: number, endKana: boolean) => {
		set('stats', (oldStats) => updateStatsOnKeyPress(oldStats, hit, miss, endKana));
  };

  if (status === GameStatus.GOBACK) {
    return <Navigate to={`/edit/${beatmap.beatmapset.id}`} replace={true} />;
  }

  const displayGameState = (isEditing && currTime !== undefined) ? 
    makeState(currTime, status) : gameState;
  
  const onInputChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    setEditingState((oldEditingState) => ({ ...oldEditingState, content: e.target.value }));
  }

  return (
    <EditorAreaContainer>
      {isEditing ? <EditorTimeline 
        windowLength={4000}
        currTime={currTime ?? 0}
        lines={lines}
        endTime={beatmap.endTime}
      /> : <TimelineMessageBox>
        <Line size="1.25em">Testing Mode</Line>
      </TimelineMessageBox>}
      <GameAreaDisplay
        user={user}
        beatmap={beatmap}
        gameState={displayGameState}
        keyCallback={isTesting ? keyCallback : () => {}}
        setGameState={isTesting ? setGameState : () => {}}
        config={config}
      />
      {editingState.status === EditingStatus.LINE && 
        <LineInput onChange={onInputChange} />}
      {editingState.status === EditingStatus.SYLLABLE && 
        <SyllableInput onChange={onInputChange} />}
      {isEditing ? <EditorScrollBar 
        currTime={currTime ?? 0}
        setCurrTime={setSeekingTo}
        lines={lines}
        endTime={beatmap.endTime}
        length={beatmap.beatmapset.duration}
      /> : <TimelineMessageBox>
        <Line size="1.25em">Testing Mode</Line>
      </TimelineMessageBox>}
    </EditorAreaContainer>
  );
}

export default EditorArea;
