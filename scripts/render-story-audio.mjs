import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";

const sampleRate = 22050;
const root = new URL("../public/audio/story-chapters/", import.meta.url);
const manifestUrl = new URL("../content/chapter-03-05-audio-manifest.json", import.meta.url);
const moduleUrl = new URL("../app/lib/story-chapters/audio-assets.ts", import.meta.url);

function rng(seed) {
  let value = seed >>> 0;
  return () => {
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    return (value >>> 0) / 0xffffffff;
  };
}

function encodeWave(samples) {
  const buffer = Buffer.alloc(44 + samples.length * 2);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(buffer.length - 8, 4);
  buffer.write("WAVEfmt ", 8);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((sample, index) => buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample)) * 32767), 44 + index * 2));
  return buffer;
}

function makeBgm({ duration, roots, pulse, seed }) {
  const samples = new Float32Array(Math.floor(duration * sampleRate));
  const random = rng(seed);
  let noise = 0;
  for (let index = 0; index < samples.length; index += 1) {
    const t = index / sampleRate;
    noise = noise * .988 + (random() * 2 - 1) * .012;
    const drone = roots.reduce((sum, root, voice) => sum + Math.sin((t * (root + Math.sin(t * .07) * .25)) * Math.PI * 2 + voice) * (.1 / (voice + 1)), 0);
    const beatPhase = t % pulse;
    const beat = Math.exp(-beatPhase * 8) * Math.sin(t * roots[0] * 4 * Math.PI) * .15;
    const edge = Math.max(0, Math.min(1, t / 1.2, (duration - t) / 1.2));
    samples[index] = (drone + beat + noise * .04) * edge;
  }
  return encodeWave(samples);
}

function makeSfx({ duration, start, end, noise, seed }) {
  const samples = new Float32Array(Math.floor(duration * sampleRate));
  const random = rng(seed);
  let phase = 0;
  let filteredNoise = 0;
  for (let index = 0; index < samples.length; index += 1) {
    const t = index / sampleRate;
    const ratio = t / duration;
    phase += (start * Math.pow(end / start, ratio)) / sampleRate;
    filteredNoise = filteredNoise * .76 + (random() * 2 - 1) * .24;
    const attack = Math.min(1, t / .025);
    const release = Math.max(0, (duration - t) / Math.min(.35, duration * .45));
    samples[index] = (Math.sin(phase * Math.PI * 2) * .32 + filteredNoise * noise) * Math.min(attack, release);
  }
  return encodeWave(samples);
}

const bgmDefinitions = {
  "urban-dread": { duration: 26, roots: [61.74, 92.5, 123.47, 185], pulse: 1.8, seed: 303 },
  "warehouse-deception": { duration: 24, roots: [73.42, 110, 146.83, 220], pulse: 1.1, seed: 404 },
  "bear-pressure": { duration: 20, roots: [55, 82.41, 110, 164.81], pulse: .62, seed: 505 },
};

const sfxDefinitions = {
  "store-door": { duration: 1.1, start: 180, end: 52, noise: .35, seed: 31 },
  "bell-sword": { duration: 2.6, start: 432, end: 418, noise: .04, seed: 32 },
  "team-split": { duration: .9, start: 260, end: 82, noise: .18, seed: 33 },
  "light-switch": { duration: .35, start: 820, end: 140, noise: .16, seed: 41 },
  "pocket-grab": { duration: .5, start: 510, end: 120, noise: .22, seed: 42 },
  "wing-warp": { duration: 1.4, start: 740, end: 72, noise: .58, seed: 43 },
  "team-lights": { duration: .8, start: 330, end: 98, noise: .2, seed: 51 },
  "bear-gate": { duration: 1.8, start: 84, end: 35, noise: .7, seed: 52 },
  "plate-hit": { duration: .75, start: 190, end: 41, noise: .5, seed: 53 },
  "shoe-hit": { duration: .4, start: 340, end: 86, noise: .3, seed: 54 },
  "countdown-zero": { duration: 1.2, start: 880, end: 110, noise: .12, seed: 55 },
  "dao-spill": { duration: 1.1, start: 690, end: 210, noise: .18, seed: 56 },
  "fight-impact": { duration: .55, start: 120, end: 38, noise: .62, seed: 57 },
};

async function writeGroup(group, definitions, renderer) {
  const directory = new URL(`${group}/`, root);
  await mkdir(directory, { recursive: true });
  const assets = {};
  for (const [id, definition] of Object.entries(definitions)) {
    const data = renderer(definition);
    const sha256 = createHash("sha256").update(data).digest("hex");
    const fileName = `${id}.${sha256.slice(0, 12)}.wav`;
    await writeFile(new URL(fileName, directory), data);
    assets[id] = { src: `/audio/story-chapters/${group}/${fileName}`, sha256, durationMs: Math.round(definition.duration * 1000) };
  }
  return assets;
}

const bgm = await writeGroup("bgm", bgmDefinitions, makeBgm);
const sfx = await writeGroup("sfx", sfxDefinitions, makeSfx);
await writeFile(manifestUrl, `${JSON.stringify({ version: 1, generatedBy: "scripts/render-story-audio.mjs", bgm, sfx }, null, 2)}\n`, "utf8");
await writeFile(moduleUrl, `export const STORY_BGM_ASSETS = ${JSON.stringify(bgm, null, 2)} as const;\n\nexport const STORY_SFX_ASSETS = ${JSON.stringify(sfx, null, 2)} as const;\n\nexport type StoryBgmId = keyof typeof STORY_BGM_ASSETS;\nexport type StorySfxId = keyof typeof STORY_SFX_ASSETS;\n`, "utf8");
console.log(`Rendered ${Object.keys(bgm).length} BGM and ${Object.keys(sfx).length} SFX assets.`);
