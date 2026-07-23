export const CHARACTER_VOICE_PROFILES = {
  tiantian: { label: "甜甜", portraitAsset: "tiantian-v2", gender: "female", rate: 0.92, pitch: 1.08, voiceHints: ["Xiaoxiao", "Huihui", "female"] },
  qiao: { label: "乔家劲", portraitAsset: "qiaojiajin-v1", gender: "male", rate: 0.86, pitch: 0.76, voiceHints: ["Yunxi", "Kangkang", "male"] },
  xiao: { label: "肖冉", portraitAsset: "xiaoran-v1", gender: "female", rate: 0.96, pitch: 0.98, voiceHints: ["Xiaoyi", "Huihui", "female"] },
  zhao: { label: "赵海博", portraitAsset: "zhaohaibo-v1", gender: "male", rate: 0.91, pitch: 0.84, voiceHints: ["Yunyang", "Kangkang", "male"] },
  han: { label: "韩一墨", portraitAsset: "hanyimo-v1", gender: "male", rate: 0.9, pitch: 0.88, voiceHints: ["Yunxi", "Kangkang", "male"] },
  zhang: { label: "章晨泽", portraitAsset: "zhangchenze-v1", gender: "male", rate: 0.95, pitch: 0.92, voiceHints: ["Yunyang", "Kangkang", "male"] },
  li: { label: "李尚武", portraitAsset: "lishangwu-v1", gender: "male", rate: 0.88, pitch: 0.8, voiceHints: ["Yunxi", "Kangkang", "male"] },
  lin: { label: "林檎", portraitAsset: "linqin-v1", gender: "female", rate: 0.9, pitch: 1.03, voiceHints: ["Xiaoxiao", "Huihui", "female"] },
  qixia: { label: "齐夏", portraitAsset: "qixia-v1", gender: "male", rate: 0.84, pitch: 0.79, voiceHints: ["Yunxi", "Kangkang", "male"] },
} as const;

export type CharacterVoiceId = keyof typeof CHARACTER_VOICE_PROFILES;

function resolveVoice(profile: (typeof CHARACTER_VOICE_PROFILES)[CharacterVoiceId]) {
  const voices = window.speechSynthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith("zh"));
  const hintedVoice = voices.find((voice) => {
    const normalized = `${voice.name} ${voice.voiceURI}`.toLowerCase();
    return profile.voiceHints.some((hint) => normalized.includes(hint.toLowerCase()));
  });
  return hintedVoice ?? voices[0] ?? null;
}

export class TestimonySpeech {
  private active: SpeechSynthesisUtterance | null = null;

  speak(id: CharacterVoiceId, text: string, onEnd: () => void) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;

    const profile = CHARACTER_VOICE_PROFILES[id];
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = resolveVoice(profile);
    utterance.lang = voice?.lang ?? "zh-CN";
    utterance.rate = profile.rate;
    utterance.pitch = profile.pitch;
    utterance.volume = 1;
    if (voice) utterance.voice = voice;
    utterance.onend = onEnd;
    utterance.onerror = onEnd;

    window.speechSynthesis.cancel();
    this.active = utterance;
    window.speechSynthesis.speak(utterance);
    return true;
  }

  stop() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    this.active = null;
  }
}
