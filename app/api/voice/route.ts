import { LIAR_GAME } from "../../lib/liar-game";
import { CHARACTER_VOICE_PROFILES } from "../../lib/testimony-speech";
import { voiceAssetFor } from "../../lib/voice-assets";

export const dynamic = "force-dynamic";

type VoiceKind = "testimony" | "followUp";

type CharacterId = keyof typeof CHARACTER_VOICE_PROFILES;
export const VOICE_SET_VERSION = "zhongyan-first-trial-static-v1";

function isVoiceKind(value: unknown): value is VoiceKind {
  return value === "testimony" || value === "followUp";
}

function isCharacterId(value: unknown): value is CharacterId {
  return typeof value === "string" && value in CHARACTER_VOICE_PROFILES;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    characterId?: unknown;
    speakerId?: unknown;
    kind?: unknown;
  } | null;
  const speakerId = body?.speakerId ?? body?.characterId;
  if (!body || !isCharacterId(body.characterId) || !isCharacterId(speakerId) || !isVoiceKind(body.kind)) {
    return Response.json({ error: "无效的角色语音请求。" }, { status: 400 });
  }

  const story = LIAR_GAME.stories.find((item) => item.id === body.characterId);
  const profile = CHARACTER_VOICE_PROFILES[speakerId];
  const audioUrl = voiceAssetFor(body.characterId, body.kind);
  if (!story || !profile || !audioUrl) {
    return Response.json({ error: "该固定角色语音尚未离线生成。" }, { status: 404 });
  }

  return Response.json({ audioUrl, cached: true }, {
    headers: { "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
