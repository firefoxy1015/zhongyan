import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

import { STORY_ANIMATIONS } from "../app/lib/story-chapters/animation.ts";
import { STORY_IMAGE_ASSETS } from "../app/lib/story-chapters/assets.ts";
import { bgmForStoryChapter, StoryAudioDirector } from "../app/lib/story-chapters/audio.ts";
import { STORY_CHAPTERS, STORY_PORTRAITS } from "../app/lib/story-chapters/canon.ts";
import { STORY_VOICE_ASSETS } from "../app/lib/story-chapters/voice-assets.ts";

function diskUrl(publicPath) {
  assert.match(publicPath, /^\//, `asset path must be root-relative: ${publicPath}`);
  return new URL(`../public${publicPath}`, import.meta.url);
}

function contentUrl(repositoryPath) {
  return new URL(`../${repositoryPath}`, import.meta.url);
}

async function readJson(repositoryPath) {
  return JSON.parse(await readFile(contentUrl(repositoryPath), "utf8"));
}

function digest(data) {
  return createHash("sha256").update(data).digest("hex");
}

function pngDimensions(data) {
  assert.equal(data.subarray(1, 4).toString("ascii"), "PNG");
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

test("registers every chapter 3-8 image once with provenance, references and a safe area", async () => {
  const references = await readJson("content/official-visual-reference.json");
  const referenceIds = new Set(references.sources.map((source) => source.id));
  const provenanceIds = new Set(references.assetProvenance.map((entry) => entry.id));
  const assets = Object.values(STORY_IMAGE_ASSETS);

  assert.equal(assets.length, 27);
  assert.equal(new Set(assets.map((asset) => asset.assetId)).size, assets.length);
  assert.equal(new Set(assets.map((asset) => asset.src)).size, assets.length);

  for (const [registryId, asset] of Object.entries(STORY_IMAGE_ASSETS)) {
    assert.equal(asset.assetId, registryId);
    assert.match(asset.src, /^\/art\/.+\.png$/);
    assert.match(asset.version, /^v\d+$/);
    assert.equal(asset.generationMode, "ai-generated-original");
    assert.ok(provenanceIds.has(asset.provenanceId), `${asset.assetId} has unknown provenance`);
    assert.ok(asset.referenceIds.length > 0, `${asset.assetId} has no references`);
    for (const referenceId of asset.referenceIds) {
      assert.ok(referenceIds.has(referenceId), `${asset.assetId} has unknown reference ${referenceId}`);
    }
    for (const [edge, value] of Object.entries(asset.safeArea)) {
      assert.ok(Number.isFinite(value) && value >= 0 && value <= 20, `${asset.assetId} has invalid safeArea.${edge}`);
    }

    const data = await readFile(diskUrl(asset.src));
    assert.deepEqual(pngDimensions(data), { width: asset.width, height: asset.height }, `${asset.assetId} dimensions drifted`);
  }

  for (const chapterId of [3, 4, 5, 6, 7, 8]) {
    const folder = `chapter-${String(chapterId).padStart(2, "0")}`;
    const diskSources = (await readdir(new URL(`../public/art/${folder}/`, import.meta.url), { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.endsWith(".png"))
      .map((entry) => `/art/${folder}/${entry.name}`)
      .sort();
    const registeredSources = assets.map((asset) => asset.src).filter((src) => src.startsWith(`/art/${folder}/`)).sort();
    assert.deepEqual(registeredSources, diskSources, `${folder} contains an unregistered or missing image`);
  }
});

test("generates one common manifest from the TypeScript image registry", async () => {
  const manifest = await readJson("content/story-chapters-asset-manifest.json");
  const script = await readFile(new URL("../scripts/build-story-asset-manifest.mjs", import.meta.url), "utf8");

  assert.equal(manifest.version, 2);
  assert.equal(manifest.registryModule, "app/lib/story-chapters/assets.ts");
  assert.equal(manifest.referenceFile, "content/official-visual-reference.json");
  assert.equal(manifest.linkedManifests.audio, "content/story-chapters-audio-manifest.json");
  assert.ok([
    "content/story-chapters-voice-manifest.json",
    "content/chapter-03-05-voice-manifest.json",
  ].includes(manifest.linkedManifests.voices));
  assert.match(script, /import \{ STORY_IMAGE_ASSETS \} from "\.\.\/app\/lib\/story-chapters\/assets\.ts"/);
  assert.doesNotMatch(script, /const artPaths\s*=/);
  assert.deepEqual(Object.keys(manifest.assets).sort(), Object.keys(STORY_IMAGE_ASSETS).sort());

  for (const [assetId, registered] of Object.entries(STORY_IMAGE_ASSETS)) {
    const locked = manifest.assets[assetId];
    assert.ok(locked, `${assetId} is missing from the common manifest`);
    const { bytes, sha256, ...metadata } = locked;
    assert.deepEqual(metadata, registered, `${assetId} metadata drifted between registry and manifest`);

    const data = await readFile(diskUrl(registered.src));
    assert.equal(bytes, data.length, `${assetId} byte length drifted`);
    assert.equal(sha256, digest(data), `${assetId} hash drifted`);
    assert.deepEqual(pngDimensions(data), { width: locked.width, height: locked.height });
  }
});

test("registers every runtime background and portrait referenced by canon scenes", () => {
  const assetBySource = new Map(Object.values(STORY_IMAGE_ASSETS).map((asset) => [asset.src, asset]));

  for (const chapter of Object.values(STORY_CHAPTERS)) {
    for (const scene of chapter.scenes) {
      assert.ok(assetBySource.has(scene.backgroundAsset), `${chapter.id}/${scene.id} background is not registered: ${scene.backgroundAsset}`);
      for (const portraitId of scene.portraitIds) {
        const portraitSource = STORY_PORTRAITS[portraitId];
        assert.ok(portraitSource, `${chapter.id}/${scene.id} has no runtime portrait mapping for ${portraitId}`);
        assert.ok(assetBySource.has(portraitSource), `${chapter.id}/${scene.id} portrait is not registered: ${portraitSource}`);
      }
    }
  }
});

test("links to locked audio and voice manifests whose files match their hashes", async () => {
  const manifest = await readJson("content/story-chapters-asset-manifest.json");
  const audio = await readJson(manifest.linkedManifests.audio);
  const voices = await readJson(manifest.linkedManifests.voices);

  assert.ok(Object.keys(audio.bgm).length > 0);
  assert.ok(Object.keys(audio.sfx).length > 0);
  assert.ok(Object.keys(voices.assets).length > 0);
  for (const asset of [
    ...Object.values(audio.bgm),
    ...Object.values(audio.sfx),
    ...Object.values(voices.assets),
  ]) {
    const data = await readFile(diskUrl(asset.src));
    assert.equal(digest(data), asset.sha256, asset.src);
  }
});

test("maps every declared scene animation to an implementation", () => {
  const sceneAnimationIds = Object.values(STORY_CHAPTERS).flatMap((chapter) => chapter.scenes.map((scene) => scene.animationId).filter(Boolean));
  assert.ok(sceneAnimationIds.length >= 12);
  for (const animationId of sceneAnimationIds) assert.ok(STORY_ANIMATIONS[animationId], animationId);
});

test("renders decisive events with scene-specific motion instead of one placeholder", async () => {
  const css = await readFile(new URL("../app/chapter/story-chapter.module.css", import.meta.url), "utf8");
  for (const animationId of ["c3-bell-sword", "c4-warehouse-dark", "c4-zhuque-arrival", "c5-bear-gate", "c5-plate-formation", "c5-final-twenty", "c5-dao-settlement"]) {
    assert.match(css, new RegExp(`data-animation=\\"${animationId}\\"`));
  }
  for (const keyframe of ["swordDrop", "warehouseBlackout", "featherWarp", "gateRise", "plateRoll", "countdownPulse", "daoSpill"]) {
    assert.match(css, new RegExp(`@keyframes ${keyframe}`));
  }
});

test("assigns a dedicated locked background track to every shared story chapter", () => {
  assert.deepEqual(
    [3, 4, 5, 6, 7, 8].map((chapterId) => bgmForStoryChapter(chapterId)),
    ["urban-dread", "warehouse-deception", "bear-pressure", "echo-grief", "probability-dread", "sacrifice-tension"],
  );
});

test("ignores a stale voice play promise after the player selects another line", async () => {
  const originalWindow = globalThis.window;
  const originalAudio = globalThis.Audio;
  const instances = [];

  class DeferredAudio {
    constructor(src) {
      this.src = src;
      this.currentTime = 0;
      this.volume = 1;
      this.muted = false;
      this.resolvePlay = () => {};
      this.playPromise = new Promise((resolve) => { this.resolvePlay = resolve; });
      instances.push(this);
    }
    play() { return this.playPromise; }
    pause() { this.paused = true; }
  }

  globalThis.window = {};
  globalThis.Audio = DeferredAudio;
  const director = new StoryAudioDirector();
  const [firstLineId, secondLineId] = Object.keys(STORY_VOICE_ASSETS);
  let firstStarts = 0;
  let secondStarts = 0;

  try {
    const firstPlay = director.playVoice(firstLineId, () => { firstStarts += 1; }, () => {}, () => {});
    const secondPlay = director.playVoice(secondLineId, () => { secondStarts += 1; }, () => {}, () => {});
    instances[0].resolvePlay();
    assert.equal(await firstPlay, false);
    assert.equal(firstStarts, 0);
    instances[1].resolvePlay();
    assert.equal(await secondPlay, true);
    assert.equal(secondStarts, 1);
  } finally {
    director.stop();
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
    if (originalAudio === undefined) delete globalThis.Audio;
    else globalThis.Audio = originalAudio;
  }
});
