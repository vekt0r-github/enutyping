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
} from '@/utils/beatmaputils';

import styled from 'styled-components';
import '@/utils/styles.css';
import { Line, EditorTimelineBox } from '@/utils/styles';

type Props = {
  user: User | null,
  beatmap: Beatmap,
  config: Config,
};

const EditorAreaContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const TimelineMessageBox = styled(EditorTimelineBox)`
  justify-content: center;
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

const EditorArea = ({ user, beatmap, config } : Props) => {
  const makeState = (currTime?: number, status?: GameStatus) => makeStateAt(beatmap.lines as LineData[], config, currTime, status);
  const [gameState, setGameState] = useState<GameState>(makeState());
  const set = makeSetFunc(setGameState);
  const [seekingTo, setSeekingTo] = useState<number>();

  // from iframe API; in seconds, rounded? maybe
  // maybe need later but idk
  // const [duration, setDuration] = useState<number>(Infinity);

  const {status, offset, currTime, lines, stats} = gameState;
  const currIndex = (currTime !== undefined) ? timeToLineIndex(lines, currTime) : undefined; 
  const isEditing = [GameStatus.PAUSED, GameStatus.AUTOPLAYING].includes(status);
  const isTesting = status === GameStatus.PLAYING;
  
  const startTest = () => {
    setGameState((oldState) => {
      const currIndex = timeToLineIndex(lines, oldState.currTime!);
      const currIndexValid = (currIndex !== undefined) && (currIndex > -1) && (currIndex < lines.length);
      return makeState(
        currIndexValid ? lines[currIndex].line.startTime : oldState.currTime,
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

  /**
   * Editor controls documentation (to write up in a user-facing infobox):
   * - Space: play/pause
   * - Up/Down: snap to nearest beat
   * - Left/Right: snap to nearest beat division
   * - Enter: begin/finish editing a new syllable at current time (cancelled if current time changes)
   *   - while editing: there's some kind of input where you type in
   *   - double click on a syllable: also snaps to it and begins editing
   * - Ctrl+[/]: change beat snap divisor (2, 3, 4, 6, 8, 12, 16)
   * - Ctrl+Up/Down: snap to nearest line start/end
   * - Ctrl+Left/Right: snap to nearest syllable
   * - Ctrl+Enter: enter testing mode
   * - Esc: exit testing mode or go back
   */
  const onKeyPress = (e: KeyboardEvent) => {
    if (e.repeat) { return; }
    if (e.key === " ") { // play/pause in normal edit mode
      if (isEditing) { 
        e.preventDefault();
        e.stopPropagation();
        set('status', (status === GameStatus.PAUSED) ? GameStatus.AUTOPLAYING : GameStatus.PAUSED);
      }
    };
    if (e.code === "Enter" && (e.ctrlKey || e.metaKey)) { // enter testing mode
      if (isEditing) { startTest(); }
    };
    if (e.key === "Escape") {
      if (isTesting) { stopTest(); } 
      if (isEditing) { set('status', GameStatus.GOBACK); }
    }
  };

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

  useEffect(() => {
    if (seekingTo === undefined) { return; }
    if (seekingTo === currTime) {
      setSeekingTo(undefined);
    } else {
      set('currTime', seekingTo);
    }
  }, [seekingTo, currTime]);

  useEffect(() => {
    if (currIndex === undefined) { return; }
    if (currIndex === lines.length) {
      // set('status', GameStatus.PAUSED);
    } else if (currIndex > 0) {
      set('stats', (oldStats) => updateStatsOnLineEnd(oldStats, lines[currIndex-1].line));
    }
  }, [currIndex]);
  
  useEffect(() => {
    document.addEventListener("keydown", onKeyPress);
    return () => {
      document.removeEventListener("keydown", onKeyPress);
    }
  }, [status]); // may eventually depend on other things
  
  useEffect(() => { // refresh map content
    setGameState((oldGameState) => makeState(oldGameState.currTime));
  }, [beatmap]);

  const keyCallback = (hit: number, miss: number, endKana: boolean) => {
		set('stats', (oldStats) => updateStatsOnKeyPress(oldStats, hit, miss, endKana));
  };

  if (status === GameStatus.GOBACK) {
    return <Navigate to={`/edit/${beatmap.beatmapset.id}`} replace={true} />;
  }

  const displayGameState = (isEditing && currTime !== undefined) ? 
    makeState(currTime, status) : gameState;
  
  return (
    <EditorAreaContainer>
      {isEditing ? <EditorTimeline 
        windowLength={4000}
        currTime={currTime ?? 0}
        lines={beatmap.lines ?? []}
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
      {isEditing ? <EditorScrollBar 
        currTime={currTime ?? 0}
        setCurrTime={setSeekingTo}
        lines={beatmap.lines ?? []}
        length={beatmap.beatmapset.duration}
      /> : <TimelineMessageBox>
        <Line size="1.25em">Testing Mode</Line>
      </TimelineMessageBox>}
    </EditorAreaContainer>
  );
}

export default EditorArea;
