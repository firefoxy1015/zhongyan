import { createHash } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";

import {
  CHAPTER_TWO_VOICE_LINES,
  CHAPTER_TWO_VOICE_PROFILES,
  CHAPTER_TWO_VOICE_VERSIONS,
} from "../app/lib/chapter-two/voice-lines.ts";

const apiKey = process.env.LINGKE_API_KEY;
if (!apiKey) throw new Error("LINGKE_API_KEY is required. Set it only for this one-time render command.");

const endpoint = "https://api.lk888.ai/v1/media/generate";
const statusEndpoint = "https://api.lk888.ai/v1/media/status";
const outputDirectory = new URL("../public/audio/chapter-02/voice/", import.meta.url);
const manifestUrl = new URL("../content/chapter-02-voice-manifest.json", import.meta.url);
const moduleUrl = new URL("../app/lib/chapter-two/voice-assets.ts", import.meta.url);
const onlyId = process.env.CHAPTER_TWO_VOICE_ID;

await mkdir(outputDirectory, { recursive: true });
const existingManifest = JSON.parse(await readFile(manifestUrl, "utf8").catch(() => '{"version":1,"assets":{}}'));
const assets = existingManifest.assets ?? {};

function hashInput(line) {
  return createHash("sha256")
    .update(`${line.speakerId}\n${CHAPTER_TWO_VOICE_VERSIONS[line.speakerId]}\n${line.text}`)
    .digest("hex");
}

function renderModule(currentAssets) {
  return `import type { ChapterTwoVoiceLineId, ChapterTwoVoiceSpeakerId } from "./voice-lines.ts";\n\nexport interface ChapterTwoVoiceAsset {\n  src: string;\n  sha256: string;\n  inputHash: string;\n  speakerId: ChapterTwoVoiceSpeakerId;\n  voiceVersion: string;\n  model: string;\n}\n\nexport const CHAPTER_TWO_VOICE_ASSETS: Readonly<Partial<Record<ChapterTwoVoiceLineId, ChapterTwoVoiceAsset>>> = Object.freeze(${JSON.stringify(currentAssets, null, 2)});\n\nexport function chapterTwoVoiceAsset(lineId: ChapterTwoVoiceLineId) {\n  return CHAPTER_TWO_VOICE_ASSETS[lineId];\n}\n`;
}

async function persist() {
  const manifest = {
    version: 1,
    generatedBy: "scripts/render-chapter-two-voices.mjs",
    assets,
  };
  await writeFile(manifestUrl, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await writeFile(moduleUrl, renderModule(assets), "utf8");
}

async function generate(line) {
  const profile = CHAPTER_TWO_VOICE_PROFILES[line.speakerId];
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
  if (!response.ok || !taskId) throw new Error(`${line.id}: generation request failed (${response.status}).`);

  for (let poll = 0; poll < 60; poll += 1) {
    if (poll > 0) await new Promise((resolve) => setTimeout(resolve, 1500));
    const status = await fetch(`${statusEndpoint}?task_id=${encodeURIComponent(taskId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const result = await status.json().catch(() => null);
    if (result?.state === "success" && typeof result.result_url === "string") return result.result_url;
    if (result?.is_final === true) throw new Error(`${line.id}: generation ended without audio.`);
  }
  throw new Error(`${line.id}: generation timed out.`);
}

for (const line of CHAPTER_TWO_VOICE_LINES) {
  if (onlyId && line.id !== onlyId) continue;
  const inputHash = hashInput(line);
  const existing = assets[line.id];
  if (existing) {
    if (existing.inputHash !== inputHash) throw new Error(`${line.id}: locked text or voice changed; create a new line ID.`);
    const localUrl = new URL(`../public${existing.src}`, import.meta.url);
    await access(localUrl);
    console.log(`Keeping ${line.id}.`);
    continue;
  }

  process.stdout.write(`Rendering ${line.id}... `);
  const resultUrl = await generate(line);
  const audioResponse = await fetch(resultUrl);
  if (!audioResponse.ok) throw new Error(`${line.id}: audio download failed (${audioResponse.status}).`);
  const data = Buffer.from(await audioResponse.arrayBuffer());
  if (data.length < 1024) throw new Error(`${line.id}: downloaded audio is unexpectedly small.`);
  const sha256 = createHash("sha256").update(data).digest("hex");
  const fileName = `${line.id}.${sha256.slice(0, 12)}.mp3`;
  await writeFile(new URL(fileName, outputDirectory), data);
  assets[line.id] = {
    src: `/audio/chapter-02/voice/${fileName}`,
    sha256,
    inputHash,
    speakerId: line.speakerId,
    voiceVersion: CHAPTER_TWO_VOICE_VERSIONS[line.speakerId],
    model: CHAPTER_TWO_VOICE_PROFILES[line.speakerId].model,
  };
  await persist();
  process.stdout.write("done\n");
}

await persist();
console.log(`Locked ${Object.keys(assets).length} chapter-two voice files.`);
