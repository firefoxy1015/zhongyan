import { createHash } from "node:crypto";
import { access, readFile, writeFile } from "node:fs/promises";

import { STORY_IMAGE_ASSETS } from "../app/lib/story-chapters/assets.ts";

const root = new URL("../", import.meta.url);
const referenceFile = "content/official-visual-reference.json";
const audioManifest = "content/story-chapters-audio-manifest.json";
const voiceManifestCandidates = [
  "content/story-chapters-voice-manifest.json",
  "content/chapter-03-05-voice-manifest.json",
];

function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

function pngSize(data, src) {
  if (data.length < 24 || data.subarray(1, 4).toString("ascii") !== "PNG") {
    throw new Error(`${src} is not a valid PNG asset.`);
  }
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

async function firstExisting(paths) {
  for (const path of paths) {
    try {
      await access(new URL(path, root));
      return path;
    } catch {
      // Try the next explicitly supported manifest location.
    }
  }
  throw new Error(`No voice manifest found. Tried: ${paths.join(", ")}`);
}

await access(new URL(audioManifest, root));
const voiceManifest = await firstExisting(voiceManifestCandidates);
const references = JSON.parse(await readFile(new URL(referenceFile, root), "utf8"));
const referenceIds = new Set(references.sources.map((source) => source.id));
const provenanceIds = new Set(references.assetProvenance.map((entry) => entry.id));

const assets = {};
for (const [registryId, asset] of Object.entries(STORY_IMAGE_ASSETS)) {
  if (asset.assetId !== registryId) throw new Error(`${registryId} has mismatched assetId ${asset.assetId}.`);
  if (!asset.src.startsWith("/art/") || !asset.src.endsWith(".png")) {
    throw new Error(`${registryId} must use a root-relative PNG under /art/.`);
  }
  if (!provenanceIds.has(asset.provenanceId)) {
    throw new Error(`${registryId} has unknown provenanceId ${asset.provenanceId}.`);
  }
  if (asset.referenceIds.length === 0) throw new Error(`${registryId} has no visual references.`);
  for (const referenceId of asset.referenceIds) {
    if (!referenceIds.has(referenceId)) throw new Error(`${registryId} has unknown referenceId ${referenceId}.`);
  }
  for (const [edge, value] of Object.entries(asset.safeArea)) {
    if (!Number.isFinite(value) || value < 0 || value > 20) {
      throw new Error(`${registryId} has invalid safeArea.${edge}: ${value}.`);
    }
  }

  const data = await readFile(new URL(`public${asset.src}`, root));
  const dimensions = pngSize(data, asset.src);
  if (dimensions.width !== asset.width || dimensions.height !== asset.height) {
    throw new Error(`${registryId} dimensions drifted: expected ${asset.width}x${asset.height}, found ${dimensions.width}x${dimensions.height}.`);
  }

  assets[registryId] = {
    ...asset,
    bytes: data.length,
    sha256: sha256(data),
  };
}

const manifest = {
  version: 2,
  generatedBy: "scripts/build-story-asset-manifest.mjs",
  policy: "Official materials define direction only. Registered images are original companion art and must not be presented as official frames or adaptation stills.",
  registryModule: "app/lib/story-chapters/assets.ts",
  referenceFile,
  linkedManifests: {
    audio: audioManifest,
    voices: voiceManifest,
  },
  assets,
};

await writeFile(new URL("content/story-chapters-asset-manifest.json", root), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Locked ${Object.keys(assets).length} story images; audio=${audioManifest}; voices=${voiceManifest}.`);
