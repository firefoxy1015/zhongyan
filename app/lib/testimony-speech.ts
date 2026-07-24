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

const USER_GESTURE_UNLOCK_AUDIO = "data:audio/wav;base64,UklGRrQBAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YZABAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA";

export class TestimonySpeech {
  private active: HTMLAudioElement | null = null;
  private activeObjectUrl: string | null = null;
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
    const audio = new Audio(USER_GESTURE_UNLOCK_AUDIO);
    audio.muted = true;
    audio.preload = "auto";
    this.active = audio;
    // This call happens inside the click gesture. It keeps mobile browsers willing to play
    // the generated line after Lingke's asynchronous task has finished.
    void audio.play().catch(() => undefined);

    try {
      const speakerId = kind === "followUp" ? FOLLOW_UP_SPEAKER_ID : id;
      const response = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: id, speakerId, kind }),
      });
      if (!response.ok) {
        if (this.active === audio) this.stopActiveAudio();
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
          if (this.active === audio) this.stopActiveAudio();
          if (requestId === this.requestId) onError();
          return false;
        }
        audioSource = payload.audioUrl;
      }

      if (requestId !== this.requestId) {
        if (this.activeObjectUrl === audioSource) this.releaseObjectUrl();
        return false;
      }

      audio.pause();
      audio.src = audioSource;
      audio.muted = false;
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
        if (this.active === audio && requestId === this.requestId) onStart();
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
      if (this.active === audio) this.stopActiveAudio();
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
