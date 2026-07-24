import { LIAR_GAME } from "../../lib/liar-game";
import { CHARACTER_VOICE_PROFILES } from "../../lib/testimony-speech";

export const dynamic = "force-dynamic";

type VoiceKind = "testimony" | "followUp";

type CharacterId = keyof typeof CHARACTER_VOICE_PROFILES;
export const VOICE_SET_VERSION = "zhongyan-first-trial-v3";

const LINGKE_TTS_MODEL = "gemini-2.5-pro-preview-tts";
const POLL_INTERVAL_MS = 1500;
const POLL_ATTEMPTS = 20;

type TaskSubmission = {
  data?: {
    task_id?: unknown;
    task_ids?: unknown;
  };
};

type TaskStatus = {
  state?: unknown;
  is_final?: unknown;
  result_url?: unknown;
};

function readConfig(characterId: CharacterId) {
  const apiKey = process.env.LINGKE_API_KEY;
  const profile = CHARACTER_VOICE_PROFILES[characterId];
  if (!apiKey || !profile) return null;

  return {
    apiKey,
    voiceId: profile.voiceId,
    endpoint: process.env.LINGKE_TTS_URL ?? "https://api.lk888.ai/v1/media/generate",
    statusEndpoint: process.env.LINGKE_TTS_STATUS_URL ?? "https://api.lk888.ai/v1/media/status",
  };
}

function isVoiceKind(value: unknown): value is VoiceKind {
  return value === "testimony" || value === "followUp";
}

function isCharacterId(value: unknown): value is CharacterId {
  return typeof value === "string" && value in CHARACTER_VOICE_PROFILES;
}

function taskIdFrom(payload: TaskSubmission | null) {
  if (typeof payload?.data?.task_id === "string" || typeof payload?.data?.task_id === "number") {
    return String(payload.data.task_id);
  }
  const firstTaskId = Array.isArray(payload?.data?.task_ids) ? payload.data.task_ids[0] : null;
  return typeof firstTaskId === "string" || typeof firstTaskId === "number" ? String(firstTaskId) : null;
}

async function waitForAudio(
  config: { apiKey: string; statusEndpoint: string },
  taskId: string,
) {
  for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
    if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    let response: Response;
    try {
      const url = new URL(config.statusEndpoint);
      url.searchParams.set("task_id", taskId);
      response = await fetch(url, {
        headers: { Authorization: `Bearer ${config.apiKey}` },
        cache: "no-store",
      });
    } catch {
      return null;
    }

    const payload = await response.json().catch(() => null) as TaskStatus | null;
    if (!response.ok || !payload) return null;
    if (payload.state === "success" && typeof payload.result_url === "string" && payload.result_url) {
      return payload.result_url;
    }
    if (payload.is_final === true) return null;
  }

  return null;
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

  const prompt = body.kind === "testimony" ? story.testimony : story.followUp;
  let upstream: Response;
  try {
    upstream = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: LINGKE_TTS_MODEL,
        prompt,
        params: { voice_id: config.voiceId },
      }),
      cache: "no-store",
    });
  } catch {
    return Response.json({ error: "灵客语音网关暂时无法连接。" }, { status: 502 });
  }

  if (!upstream.ok) {
    console.error("Lingke TTS submission failed", { status: upstream.status });
    return Response.json({ error: "灵客语音生成失败。", upstreamStatus: upstream.status }, { status: 502 });
  }

  const task = await upstream.json().catch(() => null) as TaskSubmission | null;
  const taskId = taskIdFrom(task);
  if (!taskId) return Response.json({ error: "灵客未返回语音任务。" }, { status: 502 });

  const audioUrl = await waitForAudio(config, taskId);
  if (!audioUrl) return Response.json({ error: "灵客语音生成超时或失败。" }, { status: 504 });

  return Response.json({ audioUrl });
}
