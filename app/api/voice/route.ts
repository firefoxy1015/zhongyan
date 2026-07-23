import { LIAR_GAME } from "../../lib/liar-game";
import { CHARACTER_VOICE_PROFILES } from "../../lib/testimony-speech";

export const dynamic = "force-dynamic";

type VoiceKind = "testimony" | "followUp";

type CharacterId = keyof typeof CHARACTER_VOICE_PROFILES;
export const VOICE_SET_VERSION = "zhongyan-first-trial-v2";

function readConfig(characterId: CharacterId) {
  const apiKey = process.env.LINGKE_API_KEY;
  const profile = CHARACTER_VOICE_PROFILES[characterId];
  if (!apiKey || !profile) return null;

  return {
    apiKey,
    voiceId: profile.voiceId,
    endpoint: process.env.LINGKE_TTS_URL ?? "https://lingkeapi.com/v1/audio/speech",
    model: process.env.LINGKE_TTS_MODEL ?? "gpt-4o-mini-tts",
    speed: Number(process.env.LINGKE_TTS_SPEED ?? "1"),
  };
}

function isVoiceKind(value: unknown): value is VoiceKind {
  return value === "testimony" || value === "followUp";
}

function isCharacterId(value: unknown): value is CharacterId {
  return typeof value === "string" && value in CHARACTER_VOICE_PROFILES;
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
      model: config.model,
      input,
      voice: config.voiceId,
      response_format: "mp3",
      speed: Number.isFinite(config.speed) && config.speed > 0 ? config.speed : 1,
    }),
    cache: "no-store",
  });

  if (!upstream.ok) {
    return Response.json({ error: "灵客语音生成失败。" }, { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "";
  if (contentType.startsWith("audio/") && upstream.body) {
    return new Response(upstream.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  }

  const payload = await upstream.json().catch(() => null) as { result?: unknown; data?: unknown } | null;
  if (!payload) return Response.json({ error: "灵客未返回可播放音频。" }, { status: 502 });

  const result = (payload.result ?? payload.data ?? payload) as Record<string, unknown>;
  const audioUrl = result.media_url ?? result.audio_url ?? result.audio ?? result.url;
  if (typeof audioUrl !== "string" || !audioUrl) {
    return Response.json({ error: "灵客未返回可播放音频。" }, { status: 502 });
  }

  return Response.json({ audioUrl });
}
