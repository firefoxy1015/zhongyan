"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { chapterTwoVoiceAsset } from "../../lib/chapter-two/voice-assets.ts";
import {
  CHAPTER_TWO_VOICE_LINES,
  CHAPTER_TWO_VOICE_PROFILES,
  type ChapterTwoVoiceLineId,
} from "../../lib/chapter-two/voice-lines.ts";
import type { ChapterTwoState } from "../../lib/chapter-two/types.ts";
import styles from "./chapter-two.module.css";

const SCENE_ORDER = [
  "aftermath",
  "hometown-map",
  "shield-assembly",
  "harpoon-rescue",
  "sky-death",
  "yes-no",
  "zodiac-corridor",
  "termination-reveal",
  "complete",
] as const;

function isUnlocked(state: ChapterTwoState, line: typeof CHAPTER_TWO_VOICE_LINES[number]) {
  const currentIndex = SCENE_ORDER.indexOf(state.scene as typeof SCENE_ORDER[number]);
  const lineIndex = SCENE_ORDER.indexOf(line.scene as typeof SCENE_ORDER[number]);
  if (lineIndex < currentIndex) return true;
  if (lineIndex > currentIndex) return false;

  if (line.scene === "aftermath") {
    return line.id === "c02-qiao-002"
      ? state.observedIds.includes("mask-writing")
      : state.solvedPuzzleIds.includes("aftermath");
  }
  if (line.scene === "hometown-map") return state.solvedPuzzleIds.includes("hometown-map");
  if (line.scene === "shield-assembly") return state.solvedPuzzleIds.includes("shield-assembly");
  if (line.scene === "harpoon-rescue") {
    return line.id === "c02-qixia-004" || state.solvedPuzzleIds.includes("harpoon-rescue");
  }
  if (line.scene === "sky-death") return state.solvedPuzzleIds.includes("sky-death");
  if (line.scene === "yes-no") {
    return !["c02-qixia-006", "c02-renshe-004"].includes(line.id)
      || state.solvedPuzzleIds.includes("yes-no");
  }
  if (line.scene === "zodiac-corridor") {
    if (line.speakerId === "renlong") return state.narrativeBeat >= 3;
    return state.narrativeBeat >= 5;
  }
  return true;
}

export default function SceneDialogue({ state, activeLineId, error, onPlay }: {
  state: ChapterTwoState;
  activeLineId: ChapterTwoVoiceLineId | null;
  error: string | null;
  onPlay: (lineId: ChapterTwoVoiceLineId) => void;
}) {
  const unlocked = useMemo(
    () => CHAPTER_TWO_VOICE_LINES.filter((line) => isUnlocked(state, line)),
    [state],
  );
  const unlockedKey = unlocked.map((line) => line.id).join("|");
  const seenLineIds = useRef(new Set<ChapterTwoVoiceLineId>());
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const firstNewLine = unlocked.find((line) => !seenLineIds.current.has(line.id));
    for (const line of unlocked) seenLineIds.current.add(line.id);
    if (firstNewLine) setLineIndex(unlocked.findIndex((line) => line.id === firstNewLine.id));
    else if (lineIndex >= unlocked.length) setLineIndex(Math.max(0, unlocked.length - 1));
  }, [lineIndex, unlocked, unlockedKey]);

  if (unlocked.length === 0) return null;

  const line = unlocked[lineIndex] ?? unlocked[0];
  const profile = CHAPTER_TWO_VOICE_PROFILES[line.speakerId];
  const asset = chapterTwoVoiceAsset(line.id);
  const playing = activeLineId === line.id;

  const moveTo = (nextIndex: number) => {
    if (activeLineId) onPlay(activeLineId);
    setLineIndex(nextIndex);
  };

  return (
    <section className={styles.sceneDialogue} aria-label="剧情对白">
      <div className={styles.dialogueSpeaker}>
        <span>{profile.label}</span>
        <i aria-hidden="true" />
      </div>
      <div className={styles.dialogueLine}>
        <p>“{line.text}”</p>
        {error && <span className={styles.voiceError}>{error}</span>}
      </div>
      <div className={styles.dialogueControls}>
        {unlocked.length > 1 && (
          <div>
            <button disabled={lineIndex === 0} onClick={() => moveTo(lineIndex - 1)} aria-label="上一句对白">‹</button>
            <span>{lineIndex + 1} / {unlocked.length}</span>
            <button disabled={lineIndex === unlocked.length - 1} onClick={() => moveTo(lineIndex + 1)} aria-label="下一句对白">›</button>
          </div>
        )}
        <button
          className={playing ? styles.voicePlaying : ""}
          disabled={!asset}
          onClick={() => onPlay(line.id)}
        >
          {playing ? "停止" : "播放语音"}
        </button>
      </div>
    </section>
  );
}
