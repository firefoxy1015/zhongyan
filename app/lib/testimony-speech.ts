import { voiceAssetFor } from "./voice-assets.ts";

export const CHARACTER_VOICE_PROFILES = {
  tiantian: {
    label: "甜甜",
    portraitAsset: "tiantian-v2",
    model: "doubao-tts-2.0",
    voiceId: "zh_female_tianmeitaozi_uranus_bigtts",
    gender: "女",
    timbre: "甜美桃子 2.0",
    deliveryDirection: "成年女性，甜美活泼、妩媚自然，不使用幼态或卡通腔。",
  },
  qiao: {
    label: "乔家劲",
    portraitAsset: "qiaojiajin-v1",
    model: "doubao-tts-2.0",
    voiceId: "zh_male_taocheng_uranus_bigtts",
    gender: "男",
    timbre: "小天 2.0",
    deliveryDirection: "广东男性的自然香港普通话口音，干脆、带江湖气，不夸张模仿粤语。",
  },
  xiao: {
    label: "肖冉",
    portraitAsset: "xiaoran-v1",
    model: "doubao-tts-2.0",
    voiceId: "zh_female_linjianvhai_uranus_bigtts",
    gender: "女",
    timbre: "邻家女孩 2.0",
    deliveryDirection: "年轻女幼师，怯生生、紧张、柔软，但吐字清楚。",
  },
  zhao: {
    label: "赵海博",
    portraitAsset: "zhaohaibo-v1",
    model: "doubao-tts-2.0",
    voiceId: "zh_male_dayi_uranus_bigtts",
    gender: "男",
    timbre: "大壹 2.0",
    deliveryDirection: "成年男医生，成熟稳重、理性克制。",
  },
  han: {
    label: "韩一墨",
    portraitAsset: "hanyimo-v1",
    model: "doubao-tts-2.0",
    voiceId: "zh_male_ruyayichen_uranus_bigtts",
    gender: "男",
    timbre: "儒雅逸辰 2.0",
    deliveryDirection: "成年男作家，文气、迟疑、克制。",
  },
  zhang: {
    label: "章晨泽",
    portraitAsset: "zhangchenze-v1",
    model: "doubao-tts-2.0",
    voiceId: "zh_female_cancan_uranus_bigtts",
    gender: "女",
    timbre: "知性湾湾 2.0",
    deliveryDirection: "成年女律师，清冷、理性、果断。",
  },
  li: {
    label: "李尚武",
    portraitAsset: "lishangwu-v1",
    model: "doubao-tts-2.0",
    voiceId: "zh_male_liufei_uranus_bigtts",
    gender: "男",
    timbre: "刘飞 2.0",
    deliveryDirection: "成年男刑警，低沉、强势、带审讯感。",
  },
  lin: {
    label: "林檎",
    portraitAsset: "linqin-v1",
    model: "doubao-tts-2.0",
    voiceId: "saturn_zh_female_wenwanshanshan_cs_tob",
    gender: "女",
    timbre: "温婉珊珊 2.0",
    deliveryDirection: "成年女性心理咨询师，温和、平静、有距离感。",
  },
  qixia: {
    label: "齐夏",
    portraitAsset: "qixia-v1",
    model: "doubao-tts-2.0",
    voiceId: "zh_male_m191_uranus_bigtts",
    gender: "男",
    timbre: "云舟 2.0",
    deliveryDirection: "成年男性，冷静、低沉、判断明确，绝不使用女声。",
  },
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
