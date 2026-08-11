export type StoryImageGenerationMode = "ai-generated-original";
export type StoryImageProvenanceId = "project-generated-companion-art";
export type StoryVisualReferenceId = "source-text" | "animation-pv" | "drama-announcement";

export interface StoryImageSafeArea {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

export interface StoryImageAsset {
  readonly assetId: string;
  readonly src: `/${string}`;
  readonly width: number;
  readonly height: number;
  readonly version: `v${number}`;
  readonly provenanceId: StoryImageProvenanceId;
  readonly generationMode: StoryImageGenerationMode;
  readonly referenceIds: readonly StoryVisualReferenceId[];
  readonly safeArea: StoryImageSafeArea;
}

const CHARACTER_REFERENCES = ["source-text", "animation-pv", "drama-announcement"] as const;
const ENVIRONMENT_REFERENCES = ["source-text", "animation-pv", "drama-announcement"] as const;
const PORTRAIT_SAFE_AREA = { top: 4, right: 7, bottom: 3, left: 7 } as const;
const ENVIRONMENT_SAFE_AREA = { top: 6, right: 6, bottom: 8, left: 6 } as const;

function generatedAsset(
  assetId: string,
  src: `/${string}`,
  width: number,
  height: number,
  version: `v${number}`,
  referenceIds: readonly StoryVisualReferenceId[],
  safeArea: StoryImageSafeArea,
): StoryImageAsset {
  return {
    assetId,
    src,
    width,
    height,
    version,
    provenanceId: "project-generated-companion-art",
    generationMode: "ai-generated-original",
    referenceIds,
    safeArea,
  };
}

export const STORY_IMAGE_ASSETS = {
  "portrait-qixia": generatedAsset("portrait-qixia", "/art/qixia-v1.png", 1024, 1536, "v1", CHARACTER_REFERENCES, PORTRAIT_SAFE_AREA),
  "portrait-qiao-jiajin": generatedAsset("portrait-qiao-jiajin", "/art/qiaojiajin-v1.png", 1024, 1536, "v1", CHARACTER_REFERENCES, PORTRAIT_SAFE_AREA),
  "portrait-tiantian": generatedAsset("portrait-tiantian", "/art/tiantian-v2.png", 1086, 1448, "v2", CHARACTER_REFERENCES, PORTRAIT_SAFE_AREA),
  "portrait-lin-qin": generatedAsset("portrait-lin-qin", "/art/linqin-v1.png", 1024, 1536, "v1", CHARACTER_REFERENCES, PORTRAIT_SAFE_AREA),
  "portrait-li-shangwu": generatedAsset("portrait-li-shangwu", "/art/lishangwu-v1.png", 864, 1821, "v1", CHARACTER_REFERENCES, PORTRAIT_SAFE_AREA),
  "portrait-zhao-haibo": generatedAsset("portrait-zhao-haibo", "/art/zhaohaibo-v1.png", 1024, 1536, "v1", CHARACTER_REFERENCES, PORTRAIT_SAFE_AREA),
  "portrait-han-yimo": generatedAsset("portrait-han-yimo", "/art/hanyimo-v1.png", 1023, 1537, "v1", CHARACTER_REFERENCES, PORTRAIT_SAFE_AREA),
  "portrait-zhang-chenze": generatedAsset("portrait-zhang-chenze", "/art/zhangchenze-v1.png", 1024, 1536, "v1", CHARACTER_REFERENCES, PORTRAIT_SAFE_AREA),
  "portrait-xiao-ran": generatedAsset("portrait-xiao-ran", "/art/xiaoran-v1.png", 864, 1821, "v1", CHARACTER_REFERENCES, PORTRAIT_SAFE_AREA),
  "shared-termination-plaza": generatedAsset("shared-termination-plaza", "/art/chapter-02/termination-plaza-v1.png", 1672, 941, "v1", ENVIRONMENT_REFERENCES, ENVIRONMENT_SAFE_AREA),
  "shared-termination-city": generatedAsset("shared-termination-city", "/art/chapter-02/termination-city-v1.png", 1672, 941, "v1", ENVIRONMENT_REFERENCES, ENVIRONMENT_SAFE_AREA),

  "c3-store-background": generatedAsset("c3-store-background", "/art/chapter-03/ruined-convenience-store-v1.png", 1672, 941, "v1", ENVIRONMENT_REFERENCES, ENVIRONMENT_SAFE_AREA),
  "c3-store-clerk": generatedAsset("c3-store-clerk", "/art/chapter-03/store-clerk-v1.png", 1024, 1536, "v1", CHARACTER_REFERENCES, PORTRAIT_SAFE_AREA),
  "c4-warehouse-background": generatedAsset("c4-warehouse-background", "/art/chapter-04/warehouse-v1.png", 1672, 941, "v1", ENVIRONMENT_REFERENCES, ENVIRONMENT_SAFE_AREA),
  "c4-human-rat": generatedAsset("c4-human-rat", "/art/chapter-04/human-rat-v1.png", 1024, 1536, "v1", CHARACTER_REFERENCES, PORTRAIT_SAFE_AREA),
  "c4-zhuque": generatedAsset("c4-zhuque", "/art/chapter-04/zhuque-v1.png", 1024, 1536, "v1", CHARACTER_REFERENCES, PORTRAIT_SAFE_AREA),
  "c5-arena-background": generatedAsset("c5-arena-background", "/art/chapter-05/underground-arena-v1.png", 1672, 941, "v1", ENVIRONMENT_REFERENCES, ENVIRONMENT_SAFE_AREA),
  "c5-ground-ox": generatedAsset("c5-ground-ox", "/art/chapter-05/ground-ox-v1.png", 1024, 1536, "v1", CHARACTER_REFERENCES, PORTRAIT_SAFE_AREA),
  "c5-zhang-shan": generatedAsset("c5-zhang-shan", "/art/chapter-05/zhang-shan-v1.png", 1024, 1536, "v1", CHARACTER_REFERENCES, PORTRAIT_SAFE_AREA),

  "c6-restaurant-background": generatedAsset("c6-restaurant-background", "/art/chapter-06/abandoned-restaurant-v1.png", 1672, 941, "v1", ENVIRONMENT_REFERENCES, ENVIRONMENT_SAFE_AREA),
  "c6-xiaoxiao": generatedAsset("c6-xiaoxiao", "/art/chapter-06/xiaoxiao-v1.png", 1024, 1536, "v1", CHARACTER_REFERENCES, PORTRAIT_SAFE_AREA),
  "c7-go-club-background": generatedAsset("c7-go-club-background", "/art/chapter-07/go-club-v1.png", 1672, 941, "v1", ENVIRONMENT_REFERENCES, ENVIRONMENT_SAFE_AREA),
  "c7-human-pig": generatedAsset("c7-human-pig", "/art/chapter-07/human-pig-v1.png", 1024, 1536, "v1", CHARACTER_REFERENCES, PORTRAIT_SAFE_AREA),
  "c7-human-pig-unmasked": generatedAsset("c7-human-pig-unmasked", "/art/chapter-07/human-pig-unmasked-v1.png", 1024, 1536, "v1", CHARACTER_REFERENCES, PORTRAIT_SAFE_AREA),
  "c7-old-lu": generatedAsset("c7-old-lu", "/art/chapter-07/old-lu-v1.png", 1024, 1536, "v1", CHARACTER_REFERENCES, PORTRAIT_SAFE_AREA),
  "c8-rabbit-room-background": generatedAsset("c8-rabbit-room-background", "/art/chapter-08/rabbit-escape-room-v1.png", 1672, 941, "v1", ENVIRONMENT_REFERENCES, ENVIRONMENT_SAFE_AREA),
  "c8-human-rabbit": generatedAsset("c8-human-rabbit", "/art/chapter-08/human-rabbit-v1.png", 1024, 1536, "v1", CHARACTER_REFERENCES, PORTRAIT_SAFE_AREA),
} as const satisfies Record<string, StoryImageAsset>;

export type StoryImageAssetId = keyof typeof STORY_IMAGE_ASSETS;
