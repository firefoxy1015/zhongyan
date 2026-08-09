import { createHash } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";

import { STORY_VOICE_LINES, STORY_VOICE_PROFILES } from "../app/lib/story-chapters/voice-lines.ts";

const apiKey = process.env.LINGKE_API_KEY;
if (!apiKey) throw new Error("LINGKE_API_KEY is required only for this one-time render command.");
const endpoint = process.env.LINGKE_TTS_URL ?? "https://api.lk888.ai/v1/media/generate";
const statusEndpoint = process.env.LINGKE_TTS_STATUS_URL ?? "https://api.lk888.ai/v1/media/status";
const outputDirectory = new URL("../public/audio/story-chapters/voice/", import.meta.url);
const manifestUrl = new URL("../content/chapter-03-05-voice-manifest.json", import.meta.url);
const moduleUrl = new URL("../app/lib/story-chapters/voice-assets.ts", import.meta.url);
const onlyId = process.env.STORY_VOICE_ID;

await mkdir(outputDirectory, { recursive: true });
const existingManifest = JSON.parse(await readFile(manifestUrl, "utf8").catch(() => '{"version":1,"assets":{}}'));
const assets = existingManifest.assets ?? {};

function inputHash(line) {
  const profile = STORY_VOICE_PROFILES[line.speakerId];
  return createHash("sha256").update(`${line.speakerId}\n${profile.voiceVersion}\n${line.text}`).digest("hex");
}

function moduleSource() {
  return `export interface StoryVoiceAsset {\n  src: string;\n  sha256: string;\n  inputHash: string;\n  speakerId: string;\n  voiceVersion: string;\n  model: string;\n}\n\nexport const STORY_VOICE_ASSETS: Readonly<Record<string, StoryVoiceAsset>> = Object.freeze(${JSON.stringify(assets, null, 2)});\n\nexport function storyVoiceAsset(lineId: string) {\n  return STORY_VOICE_ASSETS[lineId];\n}\n`;
}

async function persist() {
  await writeFile(manifestUrl, `${JSON.stringify({ version: 1, generatedBy: "scripts/render-story-voices.mjs", assets }, null, 2)}\n`, "utf8");
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
        params: { voice_id: profile.voiceId, ...(profile.synthesisParams ?? {}) },
      }),
    });
    const payload = await response.json().catch(() => null);
    const taskId = payload?.data?.task_id ?? payload?.data?.task_ids?.[0];
    if (!response.ok || !taskId) lastError = `${response.status} ${payload?.message ?? payload?.error?.message ?? "missing task id"}`;
    if (response.ok && taskId) {
      for (let poll = 0; poll < 80; poll += 1) {
        if (poll > 0) await new Promise((resolve) => setTimeout(resolve, 1500));
        const status = await fetch(`${statusEndpoint}?task_id=${encodeURIComponent(taskId)}`, { headers: { Authorization: `Bearer ${apiKey}` } });
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

for (const line of STORY_VOICE_LINES) {
  if (onlyId && line.id !== onlyId) continue;
  const expectedInputHash = inputHash(line);
  if (assets[line.id]) {
    if (assets[line.id].inputHash !== expectedInputHash) throw new Error(`${line.id}: locked text or voice changed; create a new line ID.`);
    await access(new URL(`../public${assets[line.id].src}`, import.meta.url));
    console.log(`Keeping ${line.id}.`);
    continue;
  }
  process.stdout.write(`Rendering ${line.id}... `);
  const resultUrl = await generate(line);
  const response = await fetch(resultUrl);
  if (!response.ok) throw new Error(`${line.id}: audio download failed (${response.status}).`);
  const data = Buffer.from(await response.arrayBuffer());
  if (data.length < 1024) throw new Error(`${line.id}: downloaded audio is unexpectedly small.`);
  const sha256 = createHash("sha256").update(data).digest("hex");
  const fileName = `${line.id}.${sha256.slice(0, 12)}.mp3`;
  await writeFile(new URL(fileName, outputDirectory), data);
  const profile = STORY_VOICE_PROFILES[line.speakerId];
  assets[line.id] = { src: `/audio/story-chapters/voice/${fileName}`, sha256, inputHash: expectedInputHash, speakerId: line.speakerId, voiceVersion: profile.voiceVersion, model: profile.model };
  await persist();
  process.stdout.write("done\n");
}

await persist();
console.log(`Locked ${Object.keys(assets).length} story voice files.`);
