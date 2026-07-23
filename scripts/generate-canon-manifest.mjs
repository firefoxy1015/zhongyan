import { createHash } from "node:crypto";
import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = process.env.CANON_SOURCE ??
  "C:\\Users\\Firefoxy\\Documents\\005 十日终焉 1--1496 完结 杀虫队队员\\十日终焉 1--1496 完结 杀虫队队员.txt";
const outputPath = path.join(projectRoot, "content", "canon-manifest.json");

const volumeBoundaries = [
  [1, "我听到了你们", 1, 91],
  [2, "我看到了你们", 92, 190],
  [3, "我想要见你们", 191, 300],
  [4, "我来找你们了", 301, 440],
  [5, "我很失望", 441, 557],
  [6, "准备认输了吗？", 558, 684],
  [7, "这样才对啊", 685, 808],
  [8, "来吧，来找我", 809, 926],
  [9, "我将和你见证", 927, 1105],
  [10, "这一切的终焉", 1106, 1358],
];

const buffer = await readFile(sourcePath);
const source = buffer.toString("utf8");
const lines = source.split(/\r?\n/);
const chapters = [];

for (let index = 0; index < lines.length; index += 1) {
  const match = lines[index].match(/^第(\d+)章\s*(.*)$/);
  if (match) {
    chapters.push({
      number: Number(match[1]),
      title: match[2].trim(),
      line: index + 1,
    });
  }
}

const finalChapterLine = chapters.at(-1)?.line ?? 0;
const extras = [];
let postscript = null;

for (let index = finalChapterLine; index < lines.length; index += 1) {
  if (!/^[-]{10,}$/.test(lines[index].trim())) continue;

  for (let cursor = index + 1; cursor < Math.min(index + 8, lines.length); cursor += 1) {
    const heading = lines[cursor].trim();
    if (!heading) continue;
    if (heading === "完结") break;
    if (heading.startsWith("终：")) {
      postscript = { heading, line: cursor + 1 };
      break;
    }
    extras.push({ heading, line: cursor + 1 });
    break;
  }
}

const groupedExtras = Object.entries(
  extras.reduce((groups, entry) => {
    const name = entry.heading.replace(/[（(].*$/, "");
    groups[name] = (groups[name] ?? 0) + 1;
    return groups;
  }, {}),
).map(([name, count]) => ({ name, count }));

const sourceStats = await stat(sourcePath);
const manifest = {
  source: {
    fileName: path.basename(sourcePath),
    bytes: sourceStats.size,
    lines: lines.length,
    sha256: createHash("sha256").update(buffer).digest("hex").toUpperCase(),
  },
  totals: {
    mainStoryUnits: chapters.length,
    characterExtras: extras.length,
    postscriptUnits: postscript ? 1 : 0,
    publishedUnits: chapters.length + extras.length + (postscript ? 1 : 0),
    duplicateChapterNumbers: [1357],
  },
  volumes: volumeBoundaries.map(([id, title, start, end]) => ({ id, title, start, end })),
  chapters,
  extras,
  postscript,
  groupedExtras,
};

await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Wrote ${outputPath}`);
console.log(`Mapped ${manifest.totals.publishedUnits} published units from ${manifest.source.fileName}`);
