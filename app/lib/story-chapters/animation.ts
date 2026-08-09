import type { StorySfxId } from "./audio-assets.ts";

export const STORY_ANIMATIONS: Readonly<Record<string, {
  durationMs: number;
  skippableAfterMs: number;
  sfxIds: readonly StorySfxId[];
  caption: string;
}>> = {
  "c3-hook-trade": { durationMs: 1800, skippableAfterMs: 350, sfxIds: ["store-door"], caption: "鱼钩落入医生掌心，一颗“道”留在肮脏床边。" },
  "c3-bell-sword": { durationMs: 3000, skippableAfterMs: 650, sfxIds: ["bell-sword"], caption: "黎明钟声炸响，黑色巨剑把韩一墨钉入地面。" },
  "c3-sword-board": { durationMs: 1900, skippableAfterMs: 350, sfxIds: ["team-split"], caption: "四条事实连接起来：死者认识自己看不到的剑名。" },
  "c3-team-split": { durationMs: 2200, skippableAfterMs: 400, sfxIds: ["team-split"], caption: "八个人在便利店门前分向两侧，一颗“道”抛给李尚武。" },
  "c4-warehouse-dark": { durationMs: 2200, skippableAfterMs: 400, sfxIds: ["light-switch"], caption: "货架倾倒，纸箱散落，灯灭后仓库没有任何金光。" },
  "c4-pocket-reveal": { durationMs: 1800, skippableAfterMs: 350, sfxIds: ["pocket-grab"], caption: "规则刚宣布，齐夏从人鼠上衣口袋取出“道”。" },
  "c4-zhuque-arrival": { durationMs: 3200, skippableAfterMs: 700, sfxIds: ["wing-warp"], caption: "红羽掠过街道，朱雀与逃跑的人鼠瞬间回到众人面前。" },
  "c4-team-oath": { durationMs: 1700, skippableAfterMs: 300, sfxIds: ["team-split"], caption: "三人拒绝杀人夺道，新的合作战术被写入手册。" },
  "c5-team-lights": { durationMs: 1900, skippableAfterMs: 350, sfxIds: ["team-lights"], caption: "黄绿灯停止闪烁，四名同伴被分入两座独立场地。" },
  "c5-bear-gate": { durationMs: 2800, skippableAfterMs: 600, sfxIds: ["bear-gate"], caption: "铁门升起，黑熊的白色月牙与饥饿眼神一同进入灯下。" },
  "c5-plate-formation": { durationMs: 2400, skippableAfterMs: 450, sfxIds: ["plate-hit"], caption: "圆板立起，十人排成纵列，铁板始终正对黑熊。" },
  "c5-shoe-bait": { durationMs: 1800, skippableAfterMs: 300, sfxIds: ["shoe-hit", "plate-hit"], caption: "两只运动鞋先后击中背部和鼻子，黑熊掉头冲回铁板。" },
  "c5-final-twenty": { durationMs: 3000, skippableAfterMs: 650, sfxIds: ["fight-impact", "countdown-zero", "bear-gate"], caption: "最后二十秒，目标连续转移；计时归零，黑熊被铁门后的力量拖走。" },
  "c5-dao-settlement": { durationMs: 2100, skippableAfterMs: 400, sfxIds: ["dao-spill"], caption: "十九份奖励落入布袋，金色小球在桌面连续碰撞。" },
  "c5-brain-fist": { durationMs: 2500, skippableAfterMs: 500, sfxIds: ["fight-impact", "plate-hit"], caption: "椅子碎裂；乔家劲接过正面对抗，地牛最终将两人抛开。" },
};

export function storyAnimationDuration(animationId: string, reducedMotion: boolean) {
  const spec = STORY_ANIMATIONS[animationId];
  if (!spec) return 80;
  return reducedMotion ? 80 : spec.durationMs + 100;
}
