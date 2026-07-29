import type { ChapterTwoAnimationId } from "./types.ts";
import type { ChapterTwoSfxId } from "./audio-assets.ts";

export const ANIMATION_SPECS: Record<ChapterTwoAnimationId, {
  durationMs: number;
  skippableAfterMs: number;
  sfxIds: readonly ChapterTwoSfxId[];
  caption: string;
}> = {
  "mask-writing-reveal": { durationMs: 3200, skippableAfterMs: 600, sfxIds: ["mask-flip"], caption: "羊皮面具翻到内侧，字迹从血色纤维间显现。" },
  "wall-holes-open": { durationMs: 2800, skippableAfterMs: 500, sfxIds: ["wall-morph", "chain-wind"], caption: "墙面像活物一样软化，五个方向的孔洞同时浮现。" },
  "table-turn-right": { durationMs: 2600, skippableAfterMs: 500, sfxIds: ["chain-wind"], caption: "九人合力向右，桌内链条连续上弦。" },
  "table-split": { durationMs: 3400, skippableAfterMs: 650, sfxIds: ["clock-beam", "wood-split"], caption: "座钟射出八道细光，把桌面切成九小一大。" },
  "shield-lock": { durationMs: 2400, skippableAfterMs: 450, sfxIds: ["shield-lock"], caption: "九块小板尖端向内，磁吸般闭合成锥体。" },
  "harpoon-volley": { durationMs: 3600, skippableAfterMs: 750, sfxIds: ["harpoon-volley", "injury-hit"], caption: "五个方向同时发射；斜面弹开大部分鱼叉，固定伤情仍然发生。" },
  "rope-retract": { durationMs: 2400, skippableAfterMs: 450, sfxIds: ["chain-wind"], caption: "所有绳索同时绷紧，墙洞开始回收鱼叉。" },
  "rope-cut-release": { durationMs: 3000, skippableAfterMs: 550, sfxIds: ["rope-snap", "chain-wind"], caption: "两股回收力互相牵制，绳索断裂，留下一枚鱼叉。" },
  "ceiling-holes-open": { durationMs: 2600, skippableAfterMs: 450, sfxIds: ["wall-morph"], caption: "墙洞消失，九个长方形孔在天花板中央张开。" },
  "floor-rise": { durationMs: 2800, skippableAfterMs: 500, sfxIds: ["floor-rise"], caption: "地板整体升高；方板竖直入孔，再横置卡住。" },
  "floor-collapse": { durationMs: 3400, skippableAfterMs: 700, sfxIds: ["floor-collapse"], caption: "地面粉碎，九人抓住把手悬在十米深坑上方。" },
  "snake-lever": { durationMs: 3000, skippableAfterMs: 550, sfxIds: ["lever", "floor-rise"], caption: "人蛇拉下拉杆，天花板带着九人缓缓下降。" },
  "corridor-doors": { durationMs: 3400, skippableAfterMs: 650, sfxIds: ["doors"], caption: "长廊两侧的门逐扇打开，世界的规模第一次暴露。" },
  "city-reveal": { durationMs: 4600, skippableAfterMs: 900, sfxIds: ["doors", "bell"], caption: "身后的门消失，暗红死城、电子屏与斑驳铜钟同时显形。" },
};

export function animationDuration(animationId: ChapterTwoAnimationId, reducedMotion: boolean) {
  return reducedMotion ? 80 : ANIMATION_SPECS[animationId].durationMs + 120;
}
