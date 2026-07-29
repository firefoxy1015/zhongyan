import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";

const sampleRate = 22050;
const root = new URL("../public/audio/chapter-02/", import.meta.url);
const manifestUrl = new URL("../content/chapter-02-audio-manifest.json", import.meta.url);
const moduleUrl = new URL("../app/lib/chapter-two/audio-assets.ts", import.meta.url);

function rng(seed) {
  let value = seed >>> 0;
  return () => {
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    return (value >>> 0) / 0xffffffff;
  };
}

function envelope(t, duration, attack = 0.02, release = 0.2) {
  return Math.min(1, t / attack, Math.max(0, (duration - t) / release));
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
  for (let index = 0; index < samples.length; index += 1) {
    const value = Math.max(-1, Math.min(1, samples[index]));
    buffer.writeInt16LE(Math.round(value * 32767), 44 + index * 2);
  }
  return buffer;
}

function makeBgm({ duration, roots, pulseSeconds, seed }) {
  const count = Math.floor(duration * sampleRate);
  const samples = new Float32Array(count);
  const random = rng(seed);
  let noise = 0;
  for (let index = 0; index < count; index += 1) {
    const t = index / sampleRate;
    noise = noise * 0.985 + (random() * 2 - 1) * 0.015;
    let value = roots.reduce((sum, frequency, voiceIndex) => {
      const drift = Math.sin(t * (0.08 + voiceIndex * 0.017)) * (0.32 + voiceIndex * 0.11);
      return sum + Math.sin((t * (frequency + drift)) * Math.PI * 2 + voiceIndex * 1.7) * (0.115 / (voiceIndex + 1));
    }, 0);
    const pulsePhase = t % pulseSeconds;
    const pulse = Math.exp(-pulsePhase * 7.5) * Math.sin(t * roots[0] * 4 * Math.PI) * 0.13;
    const metallic = Math.exp(-pulsePhase * 13) * Math.sin(t * 641 * Math.PI * 2) * 0.018;
    value += pulse + metallic + noise * 0.035;
    const edge = Math.min(1, t / 1.2, (duration - t) / 1.2);
    samples[index] = value * Math.max(0, edge);
  }
  return encodeWave(samples);
}

function makeSfx({ duration, startFrequency, endFrequency, noiseAmount, harmonics = 1, seed }) {
  const count = Math.floor(duration * sampleRate);
  const samples = new Float32Array(count);
  const random = rng(seed);
  let phase = 0;
  let filteredNoise = 0;
  for (let index = 0; index < count; index += 1) {
    const t = index / sampleRate;
    const ratio = t / duration;
    const frequency = startFrequency * Math.pow(endFrequency / startFrequency, ratio);
    phase += frequency / sampleRate;
    filteredNoise = filteredNoise * 0.78 + (random() * 2 - 1) * 0.22;
    let tonal = 0;
    for (let harmonic = 1; harmonic <= harmonics; harmonic += 1) {
      tonal += Math.sin(phase * Math.PI * 2 * harmonic) / harmonic;
    }
    const amp = envelope(t, duration, Math.min(.06, duration * .08), Math.min(.35, duration * .42));
    samples[index] = (tonal * 0.34 + filteredNoise * noiseAmount) * amp;
  }
  return encodeWave(samples);
}

const bgmDefinitions = {
  "room-tension": { duration: 24, roots: [82.41, 123.47, 164.81, 220], pulseSeconds: 1.45, seed: 102 },
  "harpoon-crisis": { duration: 20, roots: [73.42, 110, 146.83, 220], pulseSeconds: 0.76, seed: 214 },
  "termination-reveal": { duration: 28, roots: [61.74, 92.5, 138.59, 185], pulseSeconds: 2.2, seed: 319 },
};

const sfxDefinitions = {
  "mask-flip": { duration: .7, startFrequency: 210, endFrequency: 82, noiseAmount: .13, harmonics: 3, seed: 11 },
  "wall-morph": { duration: 1.5, startFrequency: 72, endFrequency: 38, noiseAmount: .42, harmonics: 2, seed: 12 },
  "chain-wind": { duration: 1.1, startFrequency: 720, endFrequency: 160, noiseAmount: .28, harmonics: 5, seed: 13 },
  "clock-beam": { duration: .85, startFrequency: 980, endFrequency: 210, noiseAmount: .08, harmonics: 3, seed: 14 },
  "wood-split": { duration: 1.05, startFrequency: 130, endFrequency: 46, noiseAmount: .62, harmonics: 2, seed: 15 },
  "shield-lock": { duration: .8, startFrequency: 280, endFrequency: 92, noiseAmount: .22, harmonics: 4, seed: 16 },
  "harpoon-volley": { duration: 1.2, startFrequency: 440, endFrequency: 55, noiseAmount: .72, harmonics: 3, seed: 17 },
  "injury-hit": { duration: .42, startFrequency: 94, endFrequency: 41, noiseAmount: .48, harmonics: 2, seed: 18 },
  "rope-snap": { duration: .55, startFrequency: 610, endFrequency: 75, noiseAmount: .36, harmonics: 4, seed: 19 },
  "floor-rise": { duration: 1.6, startFrequency: 48, endFrequency: 92, noiseAmount: .38, harmonics: 2, seed: 20 },
  "floor-collapse": { duration: 1.8, startFrequency: 110, endFrequency: 31, noiseAmount: .8, harmonics: 3, seed: 21 },
  lever: { duration: .8, startFrequency: 240, endFrequency: 58, noiseAmount: .24, harmonics: 4, seed: 22 },
  doors: { duration: 1.5, startFrequency: 170, endFrequency: 52, noiseAmount: .45, harmonics: 3, seed: 23 },
  bell: { duration: 3.2, startFrequency: 432, endFrequency: 421, noiseAmount: .025, harmonics: 6, seed: 24 },
};

async function writeAssets(group, definitions, render) {
  const directory = new URL(`${group}/`, root);
  await mkdir(directory, { recursive: true });
  const assets = {};
  for (const [id, definition] of Object.entries(definitions)) {
    const data = render(definition);
    const sha256 = createHash("sha256").update(data).digest("hex");
    const fileName = `${id}.${sha256.slice(0, 12)}.wav`;
    await writeFile(new URL(fileName, directory), data);
    assets[id] = {
      src: `/audio/chapter-02/${group}/${fileName}`,
      sha256,
      durationMs: Math.round(definition.duration * 1000),
    };
  }
  return assets;
}

const bgm = await writeAssets("bgm", bgmDefinitions, makeBgm);
const sfx = await writeAssets("sfx", sfxDefinitions, makeSfx);
const manifest = { version: 1, generatedBy: "scripts/render-chapter-two-audio.mjs", bgm, sfx };
await writeFile(manifestUrl, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

const moduleSource = `export const CHAPTER_TWO_BGM_ASSETS = ${JSON.stringify(bgm, null, 2)} as const;\n\nexport const CHAPTER_TWO_SFX_ASSETS = ${JSON.stringify(sfx, null, 2)} as const;\n\nexport type ChapterTwoBgmId = keyof typeof CHAPTER_TWO_BGM_ASSETS;\nexport type ChapterTwoSfxId = keyof typeof CHAPTER_TWO_SFX_ASSETS;\n`;
await writeFile(moduleUrl, moduleSource, "utf8");
console.log(`Rendered ${Object.keys(bgm).length} BGM tracks and ${Object.keys(sfx).length} SFX files.`);
