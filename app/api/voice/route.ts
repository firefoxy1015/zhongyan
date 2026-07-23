import { LIAR_GAME } from "../../lib/liar-game";

export const dynamic = "force-dynamic";

type VoiceKind = "testimony" | "followUp";

export const VOICE_ENV_BY_CHARACTER = {
  tiantian: "LINGKE_TTS_VOICE_TIANTIAN",
  qiao: "LINGKE_TTS_VOICE_QIAO",
  xiao: "LINGKE_TTS_VOICE_XIAO",
  zhao: "LINGKE_TTS_VOICE_ZHAO",
  han: "LINGKE_TTS_VOICE_HAN",
  zhang: "LINGKE_TTS_VOICE_ZHANG",
  li: "LINGKE_TTS_VOICE_LI",
  lin: "LINGKE_TTS_VOICE_LIN",
  qixia: "LINGKE_TTS_VOICE_QIXIA",
} as const;

type CharacterId = keyof typeof VOICE_ENV_BY_CHARACTER;
export const VOICE_SET_VERSION = "zhongyan-first-trial-v1";

function readConfig(characterId: CharacterId) {
  const apiKey = process.env.LINGKE_API_KEY;
  const voiceIds = Object.fromEntries(
    Object.entries(VOICE_ENV_BY_CHARACTER).map(([id, envKey]) => [id, process.env[envKey]]),
  ) as Record<CharacterId, string | undefined>;
  const configuredVoiceIds = Object.values(voiceIds);
  const hasMissingVoice = configuredVoiceIds.some((voiceId) => !voiceId);
  const hasDuplicateVoice = new Set(configuredVoiceIds).size !== configuredVoiceIds.length;
  if (
    !apiKey
    || process.env.LINGKE_TTS_VOICESET_ID !== VOICE_SET_VERSION
    || hasMissingVoice
    || hasDuplicateVoice
  ) return null;

  return {
    apiKey,
    voiceId: voiceIds[characterId] as string,
    endpoint: process.env.LINGKE_TTS_URL ?? "https://lingkeapi.com/kling/v1/audio/tts",
    speed: Number(process.env.LINGKE_TTS_SPEED ?? "1"),
  };
}

function isVoiceKind(value: unknown): value is VoiceKind {
  return value === "testimony" || value === "followUp";
}

function isCharacterId(value: unknown): value is CharacterId {
  return typeof value === "string" && value in VOICE_ENV_BY_CHARACTER;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { characterId?: unknown; kind?: unknown } | null;
  if (!body || !isCharacterId(body.characterId) || !isVoiceKind(body.kind)) {
    return Response.json({ error: "无效的角色语音请求。" }, { status: 400 });
  }

  const story = LIAR_GAME.stories.find((item) => item.id === body.characterId);
  const config = readConfig(body.characterId);
  if (!story || !config) {
    return Response.json({ error: "灵客语音尚未配置。" }, { status: 503 });
  }

  const input = body.kind === "testimony" ? story.testimony : story.followUp;
  const upstream = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      text: input,
      voice_id: config.voiceId,
      voice_language: "zh",
      voice_speed: String(Number.isFinite(config.speed) && config.speed > 0 ? config.speed : 1),
    }),
    cache: "no-store",
  });

  const payload = await upstream.json().catch(() => null) as { result?: unknown; data?: unknown } | null;
  if (!upstream.ok || !payload) {
    return Response.json({ error: "灵客语音生成失败。" }, { status: 502 });
  }

  const result = (payload.result ?? payload.data ?? payload) as Record<string, unknown>;
  const audioUrl = result.media_url ?? result.audio_url ?? result.audio ?? result.url;
  if (typeof audioUrl !== "string" || !audioUrl) {
    return Response.json({ error: "灵客未返回可播放音频。" }, { status: 502 });
  }

  return Response.json({ audioUrl });
}
