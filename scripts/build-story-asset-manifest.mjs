import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const artPaths = [
  "public/art/chapter-03/ruined-convenience-store-v1.png",
  "public/art/chapter-03/store-clerk-v1.png",
  "public/art/chapter-04/warehouse-v1.png",
  "public/art/chapter-04/human-rat-v1.png",
  "public/art/chapter-04/zhuque-v1.png",
  "public/art/chapter-05/underground-arena-v1.png",
  "public/art/chapter-05/ground-ox-v1.png",
  "public/art/chapter-05/zhang-shan-v1.png",
];

function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

function pngSize(data) {
  if (data.toString("ascii", 1, 4) !== "PNG") throw new Error("Asset is not a PNG.");
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

const art = {};
for (const relativePath of artPaths) {
  const data = await readFile(new URL(relativePath, root));
  art[`/${relativePath.replace(/^public\//, "")}`] = { sha256: sha256(data), bytes: data.length, ...pngSize(data) };
}

const audio = JSON.parse(await readFile(new URL("content/chapter-03-05-audio-manifest.json", root), "utf8"));
const voices = JSON.parse(await readFile(new URL("content/chapter-03-05-voice-manifest.json", root), "utf8").catch(() => '{"version":1,"assets":{}}'));
const manifest = {
  version: 1,
  generatedBy: "scripts/build-story-asset-manifest.mjs",
  art,
  bgm: audio.bgm,
  sfx: audio.sfx,
  voices: voices.assets,
};

await writeFile(new URL("content/chapter-03-05-asset-manifest.json", root), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Locked ${Object.keys(art).length} art, ${Object.keys(audio.bgm).length} BGM, ${Object.keys(audio.sfx).length} SFX, and ${Object.keys(voices.assets).length} voice assets.`);
