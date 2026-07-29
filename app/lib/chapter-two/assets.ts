import type { ChapterTwoSceneId } from "./types.ts";

export type ChapterTwoAssetId =
  | "interview-room-damaged"
  | "renyang-mask-inner"
  | "harpoon-wall-rig"
  | "hometown-map-board"
  | "table-wedges"
  | "bamboo-cone"
  | "harpoon-rain-fx"
  | "square-handle-board"
  | "ceiling-nine-holes"
  | "collapse-shaft"
  | "renshe"
  | "renlong"
  | "zodiac-corridor"
  | "dao-token"
  | "termination-plaza"
  | "termination-city";

export interface ChapterTwoAsset {
  id: ChapterTwoAssetId;
  src: string;
  width: number;
  height: number;
  sha256: string;
  provenanceId: "animation-pv" | "drama-announcement" | "source-text" | "chapter-one-locked";
  safeArea: { top: number; right: number; bottom: number; left: number };
}

export const CHAPTER_TWO_ASSETS: Record<ChapterTwoAssetId, ChapterTwoAsset> = {
  "interview-room-damaged": { id: "interview-room-damaged", src: "/art/chapter-02/interview-room-damaged-v2.png", width: 1672, height: 941, sha256: "f59e2603a1177e9a78455b988ff871da9a2bf59520277d7cee001e4e4c17bb0a", provenanceId: "chapter-one-locked", safeArea: { top: 8, right: 6, bottom: 8, left: 6 } },
  "renyang-mask-inner": { id: "renyang-mask-inner", src: "/art/chapter-02/renyang-mask-inner-v1.svg", width: 960, height: 560, sha256: "996c3c7f615bf36d2c296e2e1c6c190c595a8835ac66ca3cc12552fd753b1ed5", provenanceId: "source-text", safeArea: { top: 9, right: 10, bottom: 9, left: 10 } },
  "harpoon-wall-rig": { id: "harpoon-wall-rig", src: "/art/chapter-02/harpoon-wall-rig-v1.png", width: 1672, height: 941, sha256: "f59e2603a1177e9a78455b988ff871da9a2bf59520277d7cee001e4e4c17bb0a", provenanceId: "source-text", safeArea: { top: 8, right: 6, bottom: 8, left: 6 } },
  "hometown-map-board": { id: "hometown-map-board", src: "/art/chapter-02/hometown-map-board-v1.svg", width: 960, height: 640, sha256: "a1191768d9b9809fcd746da313035982ad08a3a4e0a307950172ac6065a0218f", provenanceId: "source-text", safeArea: { top: 7, right: 7, bottom: 7, left: 7 } },
  "table-wedges": { id: "table-wedges", src: "/art/chapter-02/table-wedges-v1.svg", width: 800, height: 800, sha256: "4896d4ab9e0d8922689d937b6000e8a39e6fbaf25b1e8c5da2b387934c64f43c", provenanceId: "source-text", safeArea: { top: 5, right: 5, bottom: 5, left: 5 } },
  "bamboo-cone": { id: "bamboo-cone", src: "/art/chapter-02/bamboo-cone-v1.svg", width: 800, height: 800, sha256: "26874ecb701634871bf1ee80638a90a79f6282989cf828bcc968583b984fdc15", provenanceId: "source-text", safeArea: { top: 5, right: 5, bottom: 5, left: 5 } },
  "harpoon-rain-fx": { id: "harpoon-rain-fx", src: "/art/chapter-02/harpoon-rain-fx-v1.svg", width: 1200, height: 680, sha256: "ff1b7c2054abc5a9d3a0ce7f081163fb849106745aea7adfe18277986d45a896", provenanceId: "source-text", safeArea: { top: 0, right: 0, bottom: 0, left: 0 } },
  "square-handle-board": { id: "square-handle-board", src: "/art/chapter-02/square-handle-board-v1.svg", width: 800, height: 800, sha256: "812792a49eceda75fa3557c166b3cbd86fa17d7ee4d0bf9d3ba1ebbccb5ff703", provenanceId: "source-text", safeArea: { top: 7, right: 7, bottom: 7, left: 7 } },
  "ceiling-nine-holes": { id: "ceiling-nine-holes", src: "/art/chapter-02/ceiling-nine-holes-v1.svg", width: 900, height: 700, sha256: "b37f20c571581f4c8799f7fb0c10a20d5fa94b983f58bf3ccfb752eb988f9e91", provenanceId: "source-text", safeArea: { top: 5, right: 5, bottom: 5, left: 5 } },
  "collapse-shaft": { id: "collapse-shaft", src: "/art/chapter-02/collapse-shaft-v1.png", width: 1672, height: 941, sha256: "21d0c92b72b8eee8175b272d64a1eaa6fe873993165b1fb05aa0a3f2612665e5", provenanceId: "source-text", safeArea: { top: 7, right: 5, bottom: 8, left: 5 } },
  renshe: { id: "renshe", src: "/art/chapter-02/renshe-v1.png", width: 864, height: 1820, sha256: "84410850a6d20168be6ce32140acf76c90068d328241e97ab521a5fb7f2cb5da", provenanceId: "source-text", safeArea: { top: 4, right: 6, bottom: 3, left: 6 } },
  renlong: { id: "renlong", src: "/art/chapter-02/renlong-v1.png", width: 864, height: 1821, sha256: "28c2da078bcc346201355993b33d2667417b5e0d144eb07573e3d42eebeff517", provenanceId: "animation-pv", safeArea: { top: 4, right: 7, bottom: 3, left: 7 } },
  "zodiac-corridor": { id: "zodiac-corridor", src: "/art/chapter-02/zodiac-corridor-v1.png", width: 1672, height: 941, sha256: "4a9e2374b22894fecebdf17b83c93cbba17bbcb1fefeb90dba61b64f6fbd7041", provenanceId: "animation-pv", safeArea: { top: 5, right: 5, bottom: 8, left: 5 } },
  "dao-token": { id: "dao-token", src: "/art/chapter-02/dao-token-v1.svg", width: 640, height: 640, sha256: "6a17e47300ea1645be602e6866828d1746d60eb37e385bce48d4b51101ae9d7e", provenanceId: "source-text", safeArea: { top: 8, right: 8, bottom: 8, left: 8 } },
  "termination-plaza": { id: "termination-plaza", src: "/art/chapter-02/termination-plaza-v1.png", width: 1672, height: 941, sha256: "a614b348387dab9f994faa7f77163c3e880f655a16de2b1243c9779b96666dc6", provenanceId: "animation-pv", safeArea: { top: 5, right: 4, bottom: 8, left: 4 } },
  "termination-city": { id: "termination-city", src: "/art/chapter-02/termination-city-v1.png", width: 1672, height: 941, sha256: "a614b348387dab9f994faa7f77163c3e880f655a16de2b1243c9779b96666dc6", provenanceId: "animation-pv", safeArea: { top: 5, right: 4, bottom: 8, left: 4 } },
};

export const SCENE_BACKGROUND_ASSET: Partial<Record<ChapterTwoSceneId, ChapterTwoAssetId>> = {
  aftermath: "interview-room-damaged",
  "hometown-map": "harpoon-wall-rig",
  "shield-assembly": "harpoon-wall-rig",
  "harpoon-rescue": "harpoon-wall-rig",
  "sky-death": "collapse-shaft",
  "yes-no": "collapse-shaft",
  "zodiac-corridor": "zodiac-corridor",
  "termination-reveal": "termination-plaza",
  complete: "termination-city",
};

export function assetFor(id: ChapterTwoAssetId) {
  return CHAPTER_TWO_ASSETS[id];
}
