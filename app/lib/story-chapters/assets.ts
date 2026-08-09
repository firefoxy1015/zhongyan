export const STORY_IMAGE_ASSETS = {
  "c3-store-background": { src: "/art/chapter-03/ruined-convenience-store-v1.png", width: 1672, height: 941, version: "v1" },
  "c3-store-clerk": { src: "/art/chapter-03/store-clerk-v1.png", width: 1024, height: 1536, version: "v1" },
  "c4-warehouse-background": { src: "/art/chapter-04/warehouse-v1.png", width: 1672, height: 941, version: "v1" },
  "c4-human-rat": { src: "/art/chapter-04/human-rat-v1.png", width: 1024, height: 1536, version: "v1" },
  "c4-zhuque": { src: "/art/chapter-04/zhuque-v1.png", width: 1024, height: 1536, version: "v1" },
  "c5-arena-background": { src: "/art/chapter-05/underground-arena-v1.png", width: 1672, height: 941, version: "v1" },
  "c5-ground-ox": { src: "/art/chapter-05/ground-ox-v1.png", width: 1024, height: 1536, version: "v1" },
  "c5-zhang-shan": { src: "/art/chapter-05/zhang-shan-v1.png", width: 1024, height: 1536, version: "v1" },
} as const;

export type StoryImageAssetId = keyof typeof STORY_IMAGE_ASSETS;
