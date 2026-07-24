import { voiceAssetFor } from "./voice-assets.ts";

export const CHARACTER_VOICE_PROFILES = {
  tiantian: { label: "甜甜", portraitAsset: "tiantian-v2", voiceId: "Vindemiatrix" },
  qiao: {
    label: "乔家劲",
    portraitAsset: "qiaojiajin-v1",
    voiceId: "Algenib",
    deliveryDirection: "广东男性的自然香港普通话口音，声线干脆、带一点江湖气，但不夸张模仿粤语",
  },
  xiao: { label: "肖冉", portraitAsset: "xiaoran-v1", voiceId: "Umbriel" },
  zhao: { label: "赵海博", portraitAsset: "zhaohaibo-v1", voiceId: "Rasalgethi" },
  han: { label: "韩一墨", portraitAsset: "hanyimo-v1", voiceId: "Schedar" },
  zhang: { label: "章晨泽", portraitAsset: "zhangchenze-v1", voiceId: "Achird" },
  li: { label: "李尚武", portraitAsset: "lishangwu-v1", voiceId: "Alnilam" },
  lin: { label: "林檎", portraitAsset: "linqin-v1", voiceId: "Despina" },
  qixia: { label: "齐夏", portraitAsset: "qixia-v1", voiceId: "Kore" },
} as const;

export type CharacterVoiceId = keyof typeof CHARACTER_VOICE_PROFILES;
export type VoiceLineKind = "testimony" | "followUp";
export const FOLLOW_UP_SPEAKER_ID: CharacterVoiceId = "qixia";

export class TestimonySpeech {
  private active: HTMLAudioElement | null = null;
  private requestId = 0;

  async speak(
    id: CharacterVoiceId,
    kind: VoiceLineKind,
    onStart: () => void,
    onEnd: () => void,
    onError: () => void,
  ) {
    const requestId = ++this.requestId;
    this.stopActiveAudio();
    const source = voiceAssetFor(id, kind);
    if (!source) {
      onError();
      return false;
    }

    const audio = new Audio(source);
    audio.preload = "auto";
    this.active = audio;
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

    try {
      await audio.play();
      if (this.active === audio && requestId === this.requestId) onStart();
      return true;
    } catch {
      if (this.active === audio) this.active = null;
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
