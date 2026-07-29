import {
  CHAPTER_TWO_BGM_ASSETS,
  CHAPTER_TWO_SFX_ASSETS,
  type ChapterTwoBgmId,
  type ChapterTwoSfxId,
} from "./audio-assets.ts";
import { chapterTwoVoiceAsset } from "./voice-assets.ts";
import type { ChapterTwoVoiceLineId } from "./voice-lines.ts";

export type { ChapterTwoBgmId, ChapterTwoSfxId } from "./audio-assets.ts";

export function nextChapterTwoAudioState(audioEnabled: boolean, muted: boolean) {
  if (!audioEnabled) return { audioEnabled: true, muted: false } as const;
  return { audioEnabled: true, muted: !muted } as const;
}

export class ChapterTwoAudioDirector {
  private bgm: HTMLAudioElement | null = null;
  private voice: HTMLAudioElement | null = null;
  private sfx = new Set<HTMLAudioElement>();
  private activeTrackId: ChapterTwoBgmId | null = null;
  private muted = false;
  private ducked = false;
  private fadeTimer: number | null = null;

  async start(trackId: ChapterTwoBgmId) {
    if (typeof window === "undefined" || this.muted) return false;
    if (this.bgm && this.activeTrackId === trackId) {
      try {
        await this.bgm.play();
        return true;
      } catch {
        return false;
      }
    }

    const next = new Audio(CHAPTER_TWO_BGM_ASSETS[trackId].src);
    next.loop = true;
    next.preload = "auto";
    next.volume = 0;
    const previous = this.bgm;
    this.bgm = next;
    this.activeTrackId = trackId;
    try {
      await next.play();
      this.crossfade(previous, next, this.targetBgmVolume());
      return true;
    } catch {
      if (this.bgm === next) {
        this.bgm = previous;
        this.activeTrackId = null;
      }
      return false;
    }
  }

  playSfx(sfxId: ChapterTwoSfxId) {
    if (this.muted || typeof window === "undefined") return;
    const audio = new Audio(CHAPTER_TWO_SFX_ASSETS[sfxId].src);
    audio.preload = "auto";
    audio.volume = 0.72;
    this.sfx.add(audio);
    const release = () => this.sfx.delete(audio);
    audio.onended = release;
    audio.onerror = release;
    void audio.play().catch(release);
  }

  async playVoice(
    lineId: ChapterTwoVoiceLineId,
    onStart: () => void,
    onEnd: () => void,
    onError: () => void,
  ) {
    this.stopVoice();
    const asset = chapterTwoVoiceAsset(lineId);
    if (!asset || typeof window === "undefined") {
      onError();
      return false;
    }
    const audio = new Audio(asset.src);
    audio.preload = "auto";
    this.voice = audio;
    audio.onended = () => {
      if (this.voice !== audio) return;
      this.voice = null;
      this.setDucked(false);
      onEnd();
    };
    audio.onerror = () => {
      if (this.voice !== audio) return;
      this.voice = null;
      this.setDucked(false);
      onError();
    };
    try {
      this.setDucked(true);
      await audio.play();
      onStart();
      return true;
    } catch {
      if (this.voice === audio) this.voice = null;
      this.setDucked(false);
      onError();
      return false;
    }
  }

  stopVoice() {
    if (!this.voice) return;
    this.voice.pause();
    this.voice.currentTime = 0;
    this.voice = null;
    this.setDucked(false);
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.bgm) this.bgm.volume = muted ? 0 : this.targetBgmVolume();
    if (this.voice) this.voice.muted = muted;
    for (const audio of this.sfx) audio.muted = muted;
  }

  setDucked(ducked: boolean) {
    this.ducked = ducked;
    if (this.bgm && !this.muted) this.rampVolume(this.bgm, this.targetBgmVolume(), 180);
  }

  hit(kind: "clock" | "chain" | "wood" | "impact" | "door" | "bell") {
    const map: Record<typeof kind, ChapterTwoSfxId> = {
      clock: "clock-beam",
      chain: "chain-wind",
      wood: "wood-split",
      impact: "injury-hit",
      door: "doors",
      bell: "bell",
    };
    this.playSfx(map[kind]);
  }

  stop() {
    if (this.fadeTimer !== null) window.clearInterval(this.fadeTimer);
    this.fadeTimer = null;
    this.stopVoice();
    if (this.bgm) {
      this.bgm.pause();
      this.bgm.currentTime = 0;
    }
    for (const audio of this.sfx) {
      audio.pause();
      audio.currentTime = 0;
    }
    this.sfx.clear();
    this.bgm = null;
    this.activeTrackId = null;
  }

  private targetBgmVolume() {
    return this.ducked ? 0.09 : 0.34;
  }

  private crossfade(previous: HTMLAudioElement | null, next: HTMLAudioElement, target: number) {
    if (this.fadeTimer !== null) window.clearInterval(this.fadeTimer);
    let step = 0;
    this.fadeTimer = window.setInterval(() => {
      step += 1;
      const progress = Math.min(1, step / 12);
      next.volume = this.muted ? 0 : target * progress;
      if (previous) previous.volume = Math.max(0, previous.volume * (1 - progress));
      if (progress < 1) return;
      if (previous) {
        previous.pause();
        previous.currentTime = 0;
      }
      if (this.fadeTimer !== null) window.clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }, 35);
  }

  private rampVolume(audio: HTMLAudioElement, target: number, durationMs: number) {
    const start = audio.volume;
    const startedAt = performance.now();
    const tick = (now: number) => {
      if (audio !== this.bgm) return;
      const progress = Math.min(1, (now - startedAt) / durationMs);
      audio.volume = start + (target - start) * progress;
      if (progress < 1) window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  }
}
