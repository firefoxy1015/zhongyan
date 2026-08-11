import { createHash } from "node:crypto";
import { access, mkdir, open, readFile, unlink, writeFile } from "node:fs/promises";

import {
  STORY_VOICE_LINES,
  STORY_VOICE_PROFILES,
  storyVoiceLockPayload,
} from "../app/lib/story-chapters/voice-lines.ts";

const checkOnly = process.argv.includes("--check");
const repairLockedAsset = process.env.STORY_VOICE_REPAIR === "1";
const onlyId = process.env.STORY_VOICE_ID;
const apiKey = process.env.LINGKE_API_KEY;
if (!checkOnly && !apiKey) {
  throw new Error("LINGKE_API_KEY is required only by this explicit one-time render command.");
}

const endpoint = process.env.LINGKE_TTS_URL ?? "https://api.lk888.ai/v1/media/generate";
const statusEndpoint = process.env.LINGKE_TTS_STATUS_URL ?? "https://api.lk888.ai/v1/media/status";
const outputDirectory = new URL("../public/audio/story-chapters/voice/", import.meta.url);
const lockUrl = new URL(".render.lock", outputDirectory);
const manifestUrl = new URL("../content/story-chapters-voice-manifest.json", import.meta.url);
const moduleUrl = new URL("../app/lib/story-chapters/voice-assets.ts", import.meta.url);

const existingManifest = JSON.parse(await readFile(manifestUrl, "utf8").catch(() => '{"version":2,"assets":{}}'));
const assets = { ...(existingManifest.assets ?? {}) };

function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

function inputHash(line) {
  return sha256(JSON.stringify(storyVoiceLockPayload(line)));
}

function expectedMetadata(line) {
  const profile = STORY_VOICE_PROFILES[line.speakerId];
  return {
    inputHash: inputHash(line),
    inputHashVersion: 3,
    textSha256: sha256(line.text),
    lineId: line.id,
    chapterId: line.chapterId,
    sceneId: line.sceneId,
    speakerId: line.speakerId,
    speakerLabel: profile.label,
    voiceVersion: profile.voiceVersion,
    model: profile.model,
    voiceId: profile.voiceId,
    provider: profile.provider,
    providerVoiceLabel: profile.providerVoiceLabel,
    catalogUrl: profile.catalogUrl,
    deliveryDirection: profile.deliveryDirection,
    synthesisParams: profile.synthesisParams,
    generationMode: "pre-rendered-one-time",
    locked: true,
  };
}

function validateRegistries() {
  const voicePairs = new Map();
  for (const [speakerId, profile] of Object.entries(STORY_VOICE_PROFILES)) {
    const pair = `${profile.model}\u0000${profile.voiceId}`;
    if (voicePairs.has(pair)) {
      throw new Error(`${speakerId} reuses ${profile.model}/${profile.voiceId} from ${voicePairs.get(pair)}.`);
    }
    voicePairs.set(pair, speakerId);
    if (!profile.deliveryDirection.trim()) throw new Error(`${speakerId} has no deliveryDirection.`);
    if (!profile.voiceVersion.includes("locked")) throw new Error(`${speakerId} voiceVersion is not immutable.`);
    if (profile.provider === "volcengine-doubao") {
      if (profile.model !== "doubao-tts-2.0") throw new Error(`${speakerId} is not assigned to Doubao TTS 2.0.`);
      if (!profile.voiceId.endsWith("_uranus_bigtts") && !profile.voiceId.startsWith("saturn_")) {
        throw new Error(`${speakerId} is not assigned a TTS 2.0 Uranus/Saturn speaker.`);
      }
      if (profile.synthesisParams.voice_instruction !== profile.deliveryDirection) {
        throw new Error(`${speakerId} deliveryDirection is not sent as voice_instruction.`);
      }
      const speed = profile.synthesisParams.speed_ratio;
      if (typeof speed !== "number" || speed < 0.5 || speed > 2) throw new Error(`${speakerId} has invalid speed_ratio.`);
    }
  }

  const lineIds = new Set();
  for (const line of STORY_VOICE_LINES) {
    if (lineIds.has(line.id)) throw new Error(`Duplicate story voice line ID: ${line.id}.`);
    lineIds.add(line.id);
    if (!STORY_VOICE_PROFILES[line.speakerId]) throw new Error(`${line.id} has no fixed voice profile.`);
  }
}

function assetMetadataMatches(asset, expected) {
  for (const [key, value] of Object.entries(expected)) {
    if (JSON.stringify(asset?.[key]) !== JSON.stringify(value)) return false;
  }
  return true;
}

async function verifyFile(asset) {
  if (!asset?.src || !asset?.sha256) return false;
  try {
    const data = await readFile(new URL(`../public${asset.src}`, import.meta.url));
    return data.length >= 1024 && sha256(data) === asset.sha256;
  } catch {
    return false;
  }
}

function manifestSource() {
  return `${JSON.stringify(
    {
      version: 2,
      generatedBy: "scripts/render-story-voices.mjs",
      lockPolicy: "pre-render-once-never-generate-on-click",
      inputHashVersion: 3,
      assets,
    },
    null,
    2,
  )}\n`;
}

function moduleSource() {
  return `export interface StoryVoiceAsset {\n  src: string;\n  sha256: string;\n  bytes: number;\n  inputHash: string;\n  inputHashVersion: 3;\n  textSha256: string;\n  lineId: string;\n  chapterId: number;\n  sceneId: string;\n  speakerId: string;\n  speakerLabel: string;\n  voiceVersion: string;\n  model: string;\n  voiceId: string;\n  provider: \"volcengine-doubao\" | \"minimax-clone\";\n  providerVoiceLabel: string;\n  catalogUrl: string;\n  deliveryDirection: string;\n  synthesisParams: Readonly<Record<string, string | number | boolean>>;\n  generationMode: \"pre-rendered-one-time\";\n  locked: true;\n  supersedes?: Readonly<{ src: string; sha256: string; inputHash?: string }>;\n}\n\nexport const STORY_VOICE_ASSETS: Readonly<Record<string, StoryVoiceAsset>> = Object.freeze(${JSON.stringify(assets, null, 2)});\n\nexport function storyVoiceAsset(lineId: string) {\n  return STORY_VOICE_ASSETS[lineId];\n}\n`;
}

async function persist() {
  await writeFile(manifestUrl, manifestSource(), "utf8");
  await writeFile(moduleUrl, moduleSource(), "utf8");
}

async function generate(line) {
  const profile = STORY_VOICE_PROFILES[line.speakerId];
  let lastError = "unknown API error";
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: profile.model,
        prompt: line.text,
        params: { voice_id: profile.voiceId, ...profile.synthesisParams },
      }),
    });
    const payload = await response.json().catch(() => null);
    const taskId = payload?.data?.task_id ?? payload?.data?.task_ids?.[0];
    if (!response.ok || !taskId) {
      lastError = `${response.status} ${payload?.message ?? payload?.error?.message ?? "missing task id"}`;
    }
    if (response.ok && taskId) {
      for (let poll = 0; poll < 80; poll += 1) {
        if (poll > 0) await new Promise((resolve) => setTimeout(resolve, 1500));
        const status = await fetch(`${statusEndpoint}?task_id=${encodeURIComponent(taskId)}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        const result = await status.json().catch(() => null);
        if (result?.state === "success" && typeof result.result_url === "string") return result.result_url;
        if (result?.is_final === true) {
          lastError = result?.error?.message ?? result?.message ?? `task ${result?.state ?? "failed"}`;
          break;
        }
      }
    }
    if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 2500));
  }
  throw new Error(`${line.id}: generation failed after 3 attempts (${lastError}).`);
}

async function verifyCompleteManifest() {
  if (existingManifest.version !== 2) throw new Error(`Voice manifest version ${existingManifest.version ?? "missing"} is obsolete.`);
  if (existingManifest.inputHashVersion !== 3) throw new Error("Voice manifest does not use inputHashVersion 3.");
  const expectedIds = new Set(STORY_VOICE_LINES.map((line) => line.id));
  const actualIds = Object.keys(assets);
  for (const line of STORY_VOICE_LINES) {
    const asset = assets[line.id];
    if (!assetMetadataMatches(asset, expectedMetadata(line))) throw new Error(`${line.id}: manifest metadata or lock hash drifted.`);
    if (!(await verifyFile(asset))) throw new Error(`${line.id}: locked audio file is missing or corrupt.`);
  }
  const stale = actualIds.filter((id) => !expectedIds.has(id));
  if (stale.length) throw new Error(`Voice manifest has stale line IDs: ${stale.join(", ")}.`);
}

validateRegistries();

if (checkOnly) {
  await verifyCompleteManifest();
  console.log(`Verified ${STORY_VOICE_LINES.length} immutable story voice files and ${Object.keys(STORY_VOICE_PROFILES).length} unique voices.`);
  process.exit(0);
}

await mkdir(outputDirectory, { recursive: true });
let lockHandle;
try {
  lockHandle = await open(lockUrl, "wx");
  await lockHandle.writeFile(`${JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() })}\n`, "utf8");
} catch (error) {
  if (error?.code === "EEXIST") {
    throw new Error("Another story voice render is already running (.render.lock exists). Stop it or remove a confirmed-stale lock before retrying.");
  }
  throw error;
}

try {
  for (const line of STORY_VOICE_LINES) {
    if (onlyId && line.id !== onlyId) continue;
    const expected = expectedMetadata(line);
    const current = assets[line.id];
    if (assetMetadataMatches(current, expected) && (await verifyFile(current))) {
      console.log(`Keeping ${line.id}.`);
      continue;
    }
    if (current && !repairLockedAsset) {
      throw new Error(`${line.id}: locked text, voice, delivery, or file changed; set STORY_VOICE_REPAIR=1 only for an intentional reviewed migration.`);
    }

    process.stdout.write(`Rendering ${line.id} (${expected.speakerLabel})... `);
    const resultUrl = await generate(line);
    const response = await fetch(resultUrl);
    if (!response.ok) throw new Error(`${line.id}: audio download failed (${response.status}).`);
    const data = Buffer.from(await response.arrayBuffer());
    if (data.length < 1024) throw new Error(`${line.id}: downloaded audio is unexpectedly small.`);
    const digest = sha256(data);
    const fileName = `${line.id}.${digest.slice(0, 12)}.mp3`;
    await writeFile(new URL(fileName, outputDirectory), data);
    await access(new URL(fileName, outputDirectory));
    assets[line.id] = {
      src: `/audio/story-chapters/voice/${fileName}`,
      sha256: digest,
      bytes: data.length,
      ...expected,
      ...(current?.src && current?.sha256
        ? { supersedes: { src: current.src, sha256: current.sha256, ...(current.inputHash ? { inputHash: current.inputHash } : {}) } }
        : {}),
    };
    await persist();
    process.stdout.write("done\n");
  }

  await persist();
  console.log(`Locked ${Object.keys(assets).length} story voice files; runtime playback never calls the synthesis API.`);
} finally {
  await lockHandle.close();
  await unlink(lockUrl).catch((error) => {
    if (error?.code !== "ENOENT") throw error;
  });
}
