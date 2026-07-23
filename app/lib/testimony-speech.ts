export const CHARACTER_VOICE_PROFILES = {
  tiantian: { label: "甜甜", portraitAsset: "tiantian-v2", voiceConfigKey: "LINGKE_TTS_VOICE_TIANTIAN" },
  qiao: { label: "乔家劲", portraitAsset: "qiaojiajin-v1", voiceConfigKey: "LINGKE_TTS_VOICE_QIAO" },
  xiao: { label: "肖冉", portraitAsset: "xiaoran-v1", voiceConfigKey: "LINGKE_TTS_VOICE_XIAO" },
  zhao: { label: "赵海博", portraitAsset: "zhaohaibo-v1", voiceConfigKey: "LINGKE_TTS_VOICE_ZHAO" },
  han: { label: "韩一墨", portraitAsset: "hanyimo-v1", voiceConfigKey: "LINGKE_TTS_VOICE_HAN" },
  zhang: { label: "章晨泽", portraitAsset: "zhangchenze-v1", voiceConfigKey: "LINGKE_TTS_VOICE_ZHANG" },
  li: { label: "李尚武", portraitAsset: "lishangwu-v1", voiceConfigKey: "LINGKE_TTS_VOICE_LI" },
  lin: { label: "林檎", portraitAsset: "linqin-v1", voiceConfigKey: "LINGKE_TTS_VOICE_LIN" },
  qixia: { label: "齐夏", portraitAsset: "qixia-v1", voiceConfigKey: "LINGKE_TTS_VOICE_QIXIA" },
} as const;

export type CharacterVoiceId = keyof typeof CHARACTER_VOICE_PROFILES;
export type VoiceLineKind = "testimony" | "followUp";

export class TestimonySpeech {
  private active: HTMLAudioElement | null = null;
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

      const payload = (await response.json()) as { audioUrl?: unknown };
      if (typeof payload.audioUrl !== "string" || !payload.audioUrl) {
        if (requestId === this.requestId) onError();
        return false;
      }

      if (requestId !== this.requestId) return false;

      const audio = new Audio(payload.audioUrl);
      audio.preload = "auto";
      audio.onended = () => {
        if (this.active !== audio || requestId !== this.requestId) return;
        this.active = null;
        onEnd();
      };
      audio.onerror = () => {
        if (this.active !== audio || requestId !== this.requestId) return;
        this.active = null;
        onError();
      };
      this.active = audio;
      await audio.play();
      return true;
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
  }
}
