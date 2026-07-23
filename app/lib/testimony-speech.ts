export const CHARACTER_VOICE_PROFILES = {
  tiantian: { label: "甜甜", portraitAsset: "tiantian-v2", voiceId: "tianmeixuemei-v1" },
  qiao: { label: "乔家劲", portraitAsset: "qiaojiajin-v1", voiceId: "ai_kaiya" },
  xiao: { label: "肖冉", portraitAsset: "xiaoran-v1", voiceId: "zhinen_xuesheng" },
  zhao: { label: "赵海博", portraitAsset: "zhaohaibo-v1", voiceId: "ai_chenjiahao_712" },
  han: { label: "韩一墨", portraitAsset: "hanyimo-v1", voiceId: "yizhipiannan-v1" },
  zhang: { label: "章晨泽", portraitAsset: "zhangchenze-v1", voiceId: "tiexin_nanyou" },
  li: { label: "李尚武", portraitAsset: "lishangwu-v1", voiceId: "dongbeilaotie_speech02" },
  lin: { label: "林檎", portraitAsset: "linqin-v1", voiceId: "chat1_female_new-3" },
  qixia: { label: "齐夏", portraitAsset: "qixia-v1", voiceId: "diyinnansang_DB_CN_M_04-v2" },
} as const;

export type CharacterVoiceId = keyof typeof CHARACTER_VOICE_PROFILES;
export type VoiceLineKind = "testimony" | "followUp";

export class TestimonySpeech {
  private active: HTMLAudioElement | null = null;
  private activeObjectUrl: string | null = null;
  private requestId = 0;

  async speak(id: CharacterVoiceId, kind: VoiceLineKind, onEnd: () => void, onError: () => void) {
    const requestId = ++this.requestId;
    this.stopActiveAudio();

    try {
      const response = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: id, kind }),
      });
      if (!response.ok) {
        if (requestId === this.requestId) onError();
        return false;
      }

      const contentType = response.headers.get("content-type") ?? "";
      let audioSource = "";
      if (contentType.startsWith("audio/")) {
        audioSource = URL.createObjectURL(await response.blob());
        this.activeObjectUrl = audioSource;
      } else {
        const payload = (await response.json()) as { audioUrl?: unknown };
        if (typeof payload.audioUrl !== "string" || !payload.audioUrl) {
          if (requestId === this.requestId) onError();
          return false;
        }
        audioSource = payload.audioUrl;
      }

      if (requestId !== this.requestId) {
        if (this.activeObjectUrl === audioSource) this.releaseObjectUrl();
        return false;
      }

      const audio = new Audio(audioSource);
      audio.preload = "auto";
      audio.onended = () => {
        if (this.active !== audio || requestId !== this.requestId) return;
        this.active = null;
        this.releaseObjectUrl();
        onEnd();
      };
      audio.onerror = () => {
        if (this.active !== audio || requestId !== this.requestId) return;
        this.active = null;
        this.releaseObjectUrl();
        onError();
      };
      this.active = audio;
      try {
        await audio.play();
        return true;
      } catch {
        if (this.active === audio) {
          this.active = null;
          this.releaseObjectUrl();
        }
        if (requestId === this.requestId) onError();
        return false;
      }
    } catch {
      if (requestId === this.requestId) onError();
      return false;
    }
  }

  stop() {
    this.requestId += 1;
    this.stopActiveAudio();
  }

  private stopActiveAudio() {
    if (!this.active) return;
    this.active.pause();
    this.active.currentTime = 0;
    this.active = null;
    this.releaseObjectUrl();
  }

  private releaseObjectUrl() {
    if (!this.activeObjectUrl) return;
    URL.revokeObjectURL(this.activeObjectUrl);
    this.activeObjectUrl = null;
  }
}
