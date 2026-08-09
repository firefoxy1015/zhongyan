import { STORY_BGM_ASSETS, STORY_SFX_ASSETS, type StoryBgmId, type StorySfxId } from "./audio-assets.ts";
import { storyVoiceAsset } from "./voice-assets.ts";

export function bgmForStoryChapter(chapterId: 3 | 4 | 5): StoryBgmId {
  if (chapterId === 3) return "urban-dread";
  if (chapterId === 4) return "warehouse-deception";
  return "bear-pressure";
}

export class StoryAudioDirector {
  private bgm: HTMLAudioElement | null = null;
  private voice: HTMLAudioElement | null = null;
  private sfx = new Set<HTMLAudioElement>();
  private trackId: StoryBgmId | null = null;
  private muted = false;

  async start(trackId: StoryBgmId) {
    if (typeof window === "undefined" || this.muted) return false;
    if (!this.bgm || this.trackId !== trackId) {
      this.bgm?.pause();
      this.bgm = new Audio(STORY_BGM_ASSETS[trackId].src);
      this.bgm.loop = true;
      this.bgm.preload = "auto";
      this.bgm.volume = .31;
      this.trackId = trackId;
    }
    try {
      await this.bgm.play();
      return true;
    } catch {
      return false;
    }
  }

  playSfx(id: StorySfxId) {
    if (this.muted || typeof window === "undefined") return;
    const audio = new Audio(STORY_SFX_ASSETS[id].src);
    audio.preload = "auto";
    audio.volume = .72;
    this.sfx.add(audio);
    const release = () => this.sfx.delete(audio);
    audio.onended = release;
    audio.onerror = release;
    void audio.play().catch(release);
  }

  async playVoice(lineId: string, onStart: () => void, onEnd: () => void, onError: () => void) {
    this.stopVoice();
    const asset = storyVoiceAsset(lineId);
    if (!asset || typeof window === "undefined") {
      onError();
      return false;
    }
    const audio = new Audio(asset.src);
    this.voice = audio;
    audio.preload = "auto";
    audio.onended = () => {
      if (this.voice !== audio) return;
      this.voice = null;
      if (this.bgm && !this.muted) this.bgm.volume = .31;
      onEnd();
    };
    audio.onerror = () => {
      if (this.voice !== audio) return;
      this.voice = null;
      if (this.bgm && !this.muted) this.bgm.volume = .31;
      onError();
    };
    try {
      if (this.bgm) this.bgm.volume = .08;
      await audio.play();
      onStart();
      return true;
    } catch {
      if (this.voice === audio) this.voice = null;
      if (this.bgm && !this.muted) this.bgm.volume = .31;
      onError();
      return false;
    }
  }

  stopVoice() {
    if (!this.voice) return;
    this.voice.pause();
    this.voice.currentTime = 0;
    this.voice = null;
    if (this.bgm && !this.muted) this.bgm.volume = .31;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.bgm) this.bgm.volume = muted ? 0 : .31;
    if (this.voice) this.voice.muted = muted;
    for (const audio of this.sfx) audio.muted = muted;
  }

  stop() {
    this.stopVoice();
    this.bgm?.pause();
    if (this.bgm) this.bgm.currentTime = 0;
    for (const audio of this.sfx) audio.pause();
    this.sfx.clear();
    this.bgm = null;
    this.trackId = null;
  }
}
