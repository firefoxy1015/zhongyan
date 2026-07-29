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
  return line.scene === "termination-reveal" || line.scene === "complete";
}

export default function VoiceDock({ state, activeLineId, error, onPlay }: {
  state: ChapterTwoState;
  activeLineId: ChapterTwoVoiceLineId | null;
  error: string | null;
  onPlay: (lineId: ChapterTwoVoiceLineId) => void;
}) {
  const unlocked = CHAPTER_TWO_VOICE_LINES.filter((line) => isUnlocked(state, line));
  if (unlocked.length === 0) return null;
  return (
    <section className={styles.voiceDock} aria-label="已解锁固定语音">
      <header><div><p>固定语音档案</p><span>一人一音色 · 一句一文件 · 不在点击时生成</span></div><em>{unlocked.length}/{CHAPTER_TWO_VOICE_LINES.length}</em></header>
      <div className={styles.voiceScroll} tabIndex={0}>
        {unlocked.map((line) => {
          const profile = CHAPTER_TWO_VOICE_PROFILES[line.speakerId];
          const asset = chapterTwoVoiceAsset(line.id);
          const playing = activeLineId === line.id;
          return <button disabled={!asset} className={playing ? styles.voicePlaying : ""} key={line.id} onClick={() => onPlay(line.id)}><span>{profile.label} · {profile.timbre}</span><strong>{line.text}</strong><em>{playing ? "■ 停止" : asset ? "▶ 播放" : "音频缺失"}</em></button>;
        })}
      </div>
      {error && <p className={styles.voiceError}>{error}</p>}
    </section>
  );
}
