import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  STORY_VOICE_LINES,
  STORY_VOICE_PROFILES,
  VOLCENGINE_SPEAKER_CATALOG_URL,
  storyVoiceLockPayload,
} from "../app/lib/story-chapters/voice-lines.ts";
import { CHARACTER_VOICE_PROFILES } from "../app/lib/testimony-speech.ts";

function digest(data) {
  return createHash("sha256").update(data).digest("hex");
}

function diskUrl(publicPath) {
  assert.match(publicPath, /^\//);
  return new URL(`../public${publicPath}`, import.meta.url);
}

test("locks one distinct provider voice to every chapter 3-8 character", () => {
  const profiles = Object.entries(STORY_VOICE_PROFILES);
  const voicePairs = profiles.map(([, profile]) => `${profile.model}\u0000${profile.voiceId}`);

  assert.equal(profiles.length, 19);
  assert.equal(new Set(voicePairs).size, profiles.length, "two characters share model + voiceId");

  for (const [speakerId, profile] of profiles) {
    assert.ok(profile.label.trim(), `${speakerId} has no display label`);
    assert.match(profile.voiceVersion, /locked/);
    assert.ok(profile.deliveryDirection.length >= 24, `${speakerId} deliveryDirection is not specific`);
    assert.ok(profile.providerVoiceLabel.trim());
    assert.match(profile.catalogUrl, /^https:\/\//);

    if (profile.provider === "volcengine-doubao") {
      assert.equal(profile.model, "doubao-tts-2.0");
      assert.ok(
        profile.voiceId.endsWith("_uranus_bigtts") || profile.voiceId.startsWith("saturn_"),
        `${speakerId} is not a Doubao TTS 2.0 voice`,
      );
      assert.equal(profile.catalogUrl, VOLCENGINE_SPEAKER_CATALOG_URL);
      assert.equal(profile.synthesisParams.voice_instruction, profile.deliveryDirection);
      assert.ok(profile.synthesisParams.speed_ratio >= 0.5 && profile.synthesisParams.speed_ratio <= 2);
    }
  }
});

test("keeps every returning character on the exact voice identity established in chapter one", () => {
  for (const speakerId of ["qixia", "qiao", "tiantian", "lin", "li", "zhao", "han", "zhang", "xiao"]) {
    assert.equal(STORY_VOICE_PROFILES[speakerId].model, CHARACTER_VOICE_PROFILES[speakerId].model, `${speakerId} model changed`);
    assert.equal(STORY_VOICE_PROFILES[speakerId].voiceId, CHARACTER_VOICE_PROFILES[speakerId].voiceId, `${speakerId} voiceId changed`);
  }
});

test("covers every canonical dialogue line with a stable speaker profile", () => {
  const lineIds = STORY_VOICE_LINES.map((line) => line.id);
  assert.equal(STORY_VOICE_LINES.length, 77);
  assert.equal(new Set(lineIds).size, lineIds.length, "dialogue line IDs must never be reused");
  assert.deepEqual([...new Set(STORY_VOICE_LINES.map((line) => line.chapterId))].sort(), [3, 4, 5, 6, 7, 8]);

  for (const line of STORY_VOICE_LINES) {
    assert.ok(STORY_VOICE_PROFILES[line.speakerId], `${line.id} has no speaker profile`);
    assert.ok(line.text.trim(), `${line.id} has no synthesis text`);
    assert.ok(line.sceneId.startsWith(`c${String(line.chapterId)}`), `${line.id} has a mismatched scene`);
  }
});

test("generic voice manifest locks text, voice, delivery and local audio bytes", async () => {
  const manifest = JSON.parse(await readFile(new URL("../content/story-chapters-voice-manifest.json", import.meta.url), "utf8"));
  assert.equal(manifest.version, 2);
  assert.equal(manifest.inputHashVersion, 3);
  assert.equal(manifest.lockPolicy, "pre-render-once-never-generate-on-click");
  assert.deepEqual(Object.keys(manifest.assets).sort(), STORY_VOICE_LINES.map((line) => line.id).sort());

  for (const line of STORY_VOICE_LINES) {
    const profile = STORY_VOICE_PROFILES[line.speakerId];
    const asset = manifest.assets[line.id];
    assert.ok(asset, `${line.id} is not pre-rendered`);
    assert.equal(asset.inputHashVersion, 3);
    assert.equal(asset.inputHash, digest(JSON.stringify(storyVoiceLockPayload(line))));
    assert.equal(asset.textSha256, digest(line.text));
    assert.equal(asset.lineId, line.id);
    assert.equal(asset.chapterId, line.chapterId);
    assert.equal(asset.sceneId, line.sceneId);
    assert.equal(asset.speakerId, line.speakerId);
    assert.equal(asset.speakerLabel, profile.label);
    assert.equal(asset.voiceVersion, profile.voiceVersion);
    assert.equal(asset.model, profile.model);
    assert.equal(asset.voiceId, profile.voiceId);
    assert.equal(asset.deliveryDirection, profile.deliveryDirection);
    assert.deepEqual(asset.synthesisParams, profile.synthesisParams);
    assert.equal(asset.generationMode, "pre-rendered-one-time");
    assert.equal(asset.locked, true);

    const data = await readFile(diskUrl(asset.src));
    assert.ok(data.length >= 1024);
    assert.equal(asset.bytes, data.length);
    assert.equal(asset.sha256, digest(data));
  }
});

test("voice synthesis is an explicit build step, never a click-time runtime request", async () => {
  const script = await readFile(new URL("../scripts/render-story-voices.mjs", import.meta.url), "utf8");
  const runtime = await readFile(new URL("../app/lib/story-chapters/audio.ts", import.meta.url), "utf8");

  assert.match(script, /LINGKE_API_KEY is required only by this explicit one-time render command/);
  assert.match(script, /pre-render-once-never-generate-on-click/);
  assert.match(script, /STORY_VOICE_REPAIR/);
  assert.match(script, /open\(lockUrl, "wx"\)/);
  assert.match(script, /Another story voice render is already running/);
  assert.doesNotMatch(runtime, /api\.lk888\.ai|media\/generate|LINGKE_API_KEY/);
});
