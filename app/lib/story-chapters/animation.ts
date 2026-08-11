import type { StorySfxId } from "./audio-assets.ts";

interface StoryAnimationSpec {
  durationMs: number;
  skippableAfterMs: number;
  sfxIds: readonly StorySfxId[];
  caption: string;
}

export const STORY_ANIMATIONS = {
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
  "c6-ledger-share": { durationMs: 2100, skippableAfterMs: 450, sfxIds: ["ledger-clink"], caption: "九十六颗“道”分成四份，每人二十四颗。" },
  "c6-time-fracture": { durationMs: 2600, skippableAfterMs: 550, sfxIds: ["bell-collapse"], caption: "四个年份在同一张桌上错位：2006、2019、2022、2068。" },
  "c6-dao-burn": { durationMs: 3200, skippableAfterMs: 750, sfxIds: ["bell-collapse", "fire-burst"], caption: "钟声之后，四只布袋被投入火中；九十六颗“道”全部焚毁。" },
  "c6-gokudo-strike": { durationMs: 2800, skippableAfterMs: 650, sfxIds: ["wood-impact", "bell-collapse"], caption: "极道没有留下可挽回的分支。齐夏只能记住乔家劲与甜甜倒下的顺序。" },
  "c6-rule-gap": { durationMs: 1900, skippableAfterMs: 400, sfxIds: ["fire-burst"], caption: "先在活着时取走，再焚毁，最后杀人：规则漏洞在时间线上闭合。" },
  "c6-insect-wall": { durationMs: 2500, skippableAfterMs: 550, sfxIds: ["insect-scrape"], caption: "火光之外，空眼眶的人形生物伏在墙面，用声音锁定猎物。" },
  "c6-silent-retreat": { durationMs: 2700, skippableAfterMs: 600, sfxIds: ["insect-scrape", "store-door"], caption: "呼吸、脚步、衣料摩擦都被压到最低；三人缓慢退回亮着灯的便利店。" },
  "c7-stone-split": { durationMs: 2200, skippableAfterMs: 450, sfxIds: ["stone-drop"], caption: "一颗黑子单独入碗；其余九十九颗进入另一只碗，胜率落在九十九分之七十四。" },
  "c7-double-black": { durationMs: 1800, skippableAfterMs: 350, sfxIds: ["stone-drop", "ledger-clink"], caption: "两颗棋子同时摊开。人猪的沉默确认它们都是黑色。" },
  "c7-headset-lock": { durationMs: 2200, skippableAfterMs: 450, sfxIds: ["headset-lock", "revolver-click"], caption: "冰冷与灼热的耳机锁住真假；拒绝赌命已不再是选项。" },
  "c7-one-each": { durationMs: 2100, skippableAfterMs: 450, sfxIds: ["stone-drop"], caption: "人猪反复预判后，亲手留下了一黑一白。" },
  "c7-truth-loop": { durationMs: 2600, skippableAfterMs: 550, sfxIds: ["headset-lock", "stone-drop"], caption: "真话经过说谎者，假话经过诚实者，两个回答都指向展示棋子的反面。" },
  "c7-final-shot": { durationMs: 3000, skippableAfterMs: 800, sfxIds: ["revolver-click", "revolver-shot"], caption: "第五个问题结束。门外只剩一声枪响，棋社里没有多出一颗“道”。" },
  "c8-mask-hidden": { durationMs: 1700, skippableAfterMs: 350, sfxIds: ["stone-drop"], caption: "空面具被藏到废弃桌板后。成为生肖是否需要考核、冒充会受到什么制裁，仍无人知道。" },
  "c8-blood-trail": { durationMs: 2200, skippableAfterMs: 450, sfxIds: ["water-rise"], caption: "新鲜血迹穿过街道，最终停在药店门口。" },
  "c8-evidence-swap": { durationMs: 2600, skippableAfterMs: 550, sfxIds: ["bell-collapse", "evidence-swap"], caption: "钟声前后，屏幕上的“嫁祸”消失；霉烟与塑料打火机变成干净烟盒和金属火机。" },
  "c8-water-rise": { durationMs: 2800, skippableAfterMs: 600, sfxIds: ["water-rise", "headset-lock"], caption: "鱼缸水位不断升高；钥匙在水里，水阀却离被铐住的人两步。" },
  "c8-hand-sacrifice": { durationMs: 3200, skippableAfterMs: 800, sfxIds: ["metal-break", "glass-break"], caption: "手铐越收越紧。李尚武用无法撤回的代价抵达水阀，再击碎鱼缸救下章晨泽。" },
  "c8-team-form": { durationMs: 2200, skippableAfterMs: 450, sfxIds: ["ledger-clink", "team-form"], caption: "四颗“道”交到齐夏手中；新的四人队在三道问题后成立。" },
} as const satisfies Readonly<Record<string, StoryAnimationSpec>>;

export type StoryAnimationId = keyof typeof STORY_ANIMATIONS;

export function storyAnimationDuration(animationId: StoryAnimationId, reducedMotion: boolean) {
  const spec = STORY_ANIMATIONS[animationId];
  if (!spec) throw new Error(`Unknown story animation: ${animationId}`);
  return reducedMotion ? 80 : spec.durationMs + 100;
}
