import type {
  CharacterId,
  CharacterRuntimeState,
  ChapterTwoCheckpointId,
  ChapterTwoFailureId,
  ChapterTwoObservationId,
  ChapterTwoPuzzleId,
  ChapterTwoSceneId,
  FieldError,
  PlaceId,
  RescueActionId,
  WedgeId,
  WedgeSlotId,
} from "./types.ts";

export const CHAPTER_TWO_SCOPE = {
  startLine: 1237,
  endLine: 2927,
  sourceChapters: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
} as const;

export const CHAPTER_TWO_TRIALS = [
  { id: "rain-after-bamboo", title: "雨后春笋", sourceChapter: 13 },
  { id: "death-from-above", title: "天降死亡", sourceChapter: 17 },
  { id: "yes-and-no", title: "是与非", sourceChapter: 18 },
] as const;

export const CHARACTER_NAMES: Record<CharacterId, string> = {
  qixia: "齐夏",
  qiao: "乔家劲",
  tiantian: "甜甜",
  xiao: "肖冉",
  zhao: "赵海博",
  han: "韩一墨",
  zhang: "章晨泽",
  li: "李尚武",
  lin: "林檎",
};

export const CHARACTER_OCCUPATIONS: Record<CharacterId, string> = {
  qixia: "骗子",
  qiao: "混混",
  tiantian: "陪酒小姐",
  xiao: "幼师",
  zhao: "医生",
  han: "网络作家",
  zhang: "律师",
  li: "刑警",
  lin: "心理咨询师",
};

export const CHAPTER_TWO_OBSERVATIONS: ReadonlyArray<{
  id: ChapterTwoObservationId;
  scene: ChapterTwoSceneId;
  label: string;
  observation: string;
  note: string;
  actionCost: number;
  sourceRef: { chapter: number; lineStart: number; lineEnd: number };
}> = [
  {
    id: "heart-shot",
    scene: "aftermath",
    label: "心口枪伤",
    observation: "人羊没有朝头部开枪，而是把子弹送进了心脏。他在失去意识前还痛苦挣扎了片刻。",
    note: "心脏中弹并不是最快、最少痛苦的自杀方式。",
    actionCost: 0,
    sourceRef: { chapter: 11, lineStart: 1255, lineEnd: 1279 },
  },
  {
    id: "preserved-mask",
    scene: "aftermath",
    label: "没有破损的羊皮面具",
    observation: "羊皮面具还完整地罩着头部。若子弹击穿头颅，面具很可能也会被打坏。",
    note: "他像是在保护头部某样比性命更重要的东西。",
    actionCost: 0,
    sourceRef: { chapter: 11, lineStart: 1280, lineEnd: 1291 },
  },
  {
    id: "mask-writing",
    scene: "aftermath",
    label: "面具内侧的字",
    observation: "羊皮内衬留下了新的生存提示：时钟、家乡方向、一百次转动，以及一场雨后的春笋。",
    note: "提示给了方法，但没有给出方向和结构。",
    actionCost: 0,
    sourceRef: { chapter: 11, lineStart: 1292, lineEnd: 1309 },
  },
  {
    id: "wall-holes",
    scene: "hometown-map",
    label: "墙面与屋顶孔洞",
    observation: "四面墙和屋顶都浮现出排列整齐的孔洞，孔里是正在后退、像被链条上弦的鱼叉。",
    note: "鱼叉尚未射出；四面皆有杀机。",
    actionCost: 1,
    sourceRef: { chapter: 11, lineStart: 1325, lineEnd: 1362 },
  },
  {
    id: "clock-quarter",
    scene: "hometown-map",
    label: "座钟",
    observation: "座钟接近一点一刻。提示里的“一刻不停”很可能指向一个固定的剧情时点。",
    note: "现在不是现实倒计时，调查和错误会推进座钟。",
    actionCost: 1,
    sourceRef: { chapter: 12, lineStart: 1409, lineEnd: 1416 },
  },
  {
    id: "rotating-table",
    scene: "hometown-map",
    label: "可转动的桌面",
    observation: "桌面被固定在原处，却可以缓慢转动；转动时桌内传出链条声。",
    note: "需要九个人同时出力，问题只剩方向。",
    actionCost: 1,
    sourceRef: { chapter: 12, lineStart: 1423, lineEnd: 1457 },
  },
  {
    id: "nine-hometowns",
    scene: "hometown-map",
    label: "九人的地点",
    observation: "九个人此前透露过自己的家乡或工作地点。这些地名或许不是闲话。",
    note: "先把地点写到地图上，再判断它们构成了什么。",
    actionCost: 1,
    sourceRef: { chapter: 12, lineStart: 1515, lineEnd: 1565 },
  },
  {
    id: "split-table",
    scene: "shield-assembly",
    label: "裂开的桌板",
    observation: "座钟射出的光把桌面切成九块小三角板和一块大板；每块背面都有把手。",
    note: "大板看似最安全，却未必能和其余九块共同工作。",
    actionCost: 0,
    sourceRef: { chapter: 13, lineStart: 1649, lineEnd: 1679 },
  },
  {
    id: "harpoon-ropes",
    scene: "harpoon-rescue",
    label: "鱼叉尾部的绳子",
    observation: "每根鱼叉都被绳子连接到墙洞。鱼叉停止射击后，绳子正在把它们回收。",
    note: "韩一墨的鱼叉也会被回收到墙里。",
    actionCost: 0,
    sourceRef: { chapter: 14, lineStart: 1841, lineEnd: 1955 },
  },
  {
    id: "harpoon-tail-writing",
    scene: "sky-death",
    label: "鱼叉尾部的文字",
    observation: "留下的一枚鱼叉写着：一刻钟后，死亡再次天降；躲开它们，想办法活下来。",
    note: "人羊的文字仍可能是谎言，不能只按字面站位。",
    actionCost: 1,
    sourceRef: { chapter: 16, lineStart: 2135, lineEnd: 2151 },
  },
  {
    id: "ceiling-nine-holes",
    scene: "sky-death",
    label: "九个天花板孔",
    observation: "墙洞消失后，天花板出现九个长方形孔，全部聚集在中央。",
    note: "数量与参与者、方板完全对应。",
    actionCost: 1,
    sourceRef: { chapter: 16, lineStart: 2185, lineEnd: 2209 },
  },
  {
    id: "square-board-handles",
    scene: "sky-death",
    label: "方板与把手",
    observation: "桌板碎裂后只剩中央坚硬的正方形和把手。它们既不像完整盾牌，也不像普通地板。",
    note: "孔和把手的对应关系还没有被利用。",
    actionCost: 1,
    sourceRef: { chapter: 16, lineStart: 2203, lineEnd: 2209 },
  },
  {
    id: "sheep-dog-types",
    scene: "sky-death",
    label: "羊与狗",
    observation: "刚才的合作让九人活下来了；而人羊写下的“担忧”与死亡机关又互相冲突。",
    note: "羊和狗更像游戏的规则属性，而不只是两个名字。",
    actionCost: 1,
    sourceRef: { chapter: 17, lineStart: 2241, lineEnd: 2275 },
  },
  {
    id: "shaft-door",
    scene: "yes-no",
    label: "深坑下的木门",
    observation: "地板坍塌后，九人悬在十米深坑上方；坑底角落有一扇木门。",
    note: "门后的人或许掌握拉杆，但规则未必站在参与者这边。",
    actionCost: 0,
    sourceRef: { chapter: 18, lineStart: 2391, lineEnd: 2459 },
  },
  {
    id: "snake-rules",
    scene: "yes-no",
    label: "人蛇的三问规则",
    observation: "所有人一共能问三个问题；人蛇只答是或否，而且不会说假话。只有他答应救人，才会拉下拉杆。",
    note: "肖冉已经问掉第一问，剩下两问。",
    actionCost: 0,
    sourceRef: { chapter: 18, lineStart: 2465, lineEnd: 2507 },
  },
  {
    id: "zodiac-masks",
    scene: "zodiac-corridor",
    label: "走廊里的动物面具",
    observation: "牛、马、狗、羊、蛇、鼠、鸡等面具一一出现，全部属于同一套序列。",
    note: "齐夏只能确定：这是生肖。",
    actionCost: 0,
    sourceRef: { chapter: 19, lineStart: 2661, lineEnd: 2725 },
  },
  {
    id: "human-dragon",
    scene: "zodiac-corridor",
    label: "人龙",
    observation: "人龙的面具由多种腐烂动物器官缝合而成。他说考验暂告一段落。",
    note: "他接下来会给出这个世界的第一条长期规则。",
    actionCost: 0,
    sourceRef: { chapter: 20, lineStart: 2783, lineEnd: 2817 },
  },
  {
    id: "dao-token",
    scene: "zodiac-corridor",
    label: "四颗道",
    observation: "白色外圈、金色内圈的小球略有弹性。人龙把四颗交给齐夏。",
    note: "四场考验各奖励一颗道。",
    actionCost: 0,
    sourceRef: { chapter: 20, lineStart: 2819, lineEnd: 2841 },
  },
  {
    id: "termination-plaza",
    scene: "termination-reveal",
    label: "终焉之地广场",
    observation: "出口外是暗红天空、土色太阳与破败死城。身后的门和人龙已经消失，广场电子屏亮起一句陌生的话。",
    note: "我听到了「招灾」的回响。",
    actionCost: 0,
    sourceRef: { chapter: 21, lineStart: 2885, lineEnd: 2927 },
  },
];

export const HOMETOWN_FACTS: ReadonlyArray<{
  characterId: CharacterId;
  placeId: PlaceId;
  wording: string;
}> = [
  { characterId: "li", placeId: "inner-mongolia", wording: "我是内蒙人。" },
  { characterId: "zhang", placeId: "sichuan", wording: "我是四川人。" },
  { characterId: "tiantian", placeId: "shaanxi", wording: "我在陕西。" },
  { characterId: "xiao", placeId: "yunnan", wording: "云南大理。" },
  { characterId: "qiao", placeId: "guangdong", wording: "广东。" },
  { characterId: "lin", placeId: "ningxia", wording: "宁夏人。" },
  { characterId: "zhao", placeId: "jiangsu", wording: "我在江苏工作。" },
  { characterId: "qixia", placeId: "shandong", wording: "山东。" },
  { characterId: "han", placeId: "guangxi", wording: "我是广西人。" },
];

export const PLACE_LABELS: Record<PlaceId, string> = {
  "inner-mongolia": "内蒙",
  sichuan: "四川",
  shaanxi: "陕西",
  yunnan: "云南",
  guangdong: "广东",
  ningxia: "宁夏",
  jiangsu: "江苏",
  shandong: "山东",
  guangxi: "广西",
};

export const PLACE_POINTS: Record<PlaceId, { x: number; y: number }> = {
  "inner-mongolia": { x: 54, y: 20 },
  sichuan: { x: 34, y: 58 },
  shaanxi: { x: 49, y: 48 },
  yunnan: { x: 27, y: 73 },
  guangdong: { x: 58, y: 76 },
  ningxia: { x: 44, y: 40 },
  jiangsu: { x: 67, y: 57 },
  shandong: { x: 70, y: 38 },
  guangxi: { x: 45, y: 74 },
};

export const HOMETOWN_SOLUTION = {
  direction: "right" as const,
  strokes: [
    ["ningxia", "shandong"],
    ["inner-mongolia", "sichuan", "yunnan"],
    ["guangxi", "guangdong", "shaanxi", "jiangsu"],
  ] as const,
};

export const WEDGE_IDS: readonly WedgeId[] = [
  "small-1",
  "small-2",
  "small-3",
  "small-4",
  "small-5",
  "small-6",
  "small-7",
  "small-8",
  "small-9",
  "large-decoy",
];

export const WEDGE_SLOT_IDS: readonly WedgeSlotId[] = [
  "slot-1",
  "slot-2",
  "slot-3",
  "slot-4",
  "slot-5",
  "slot-6",
  "slot-7",
  "slot-8",
  "slot-9",
];

export const CANONICAL_RESCUE_SEQUENCE: readonly RescueActionId[] = [
  "knot-opposing-ropes",
  "lin-release-knot",
  "li-cut-rope",
  "qiao-brace-han",
];

export const CANONICAL_META_QUESTION = "假如我的下一个问题是“你会不会拉下拉杆”，你的回答会跟这个问题一样吗？";

export const QUESTION_TOKEN_LABELS: Record<string, string> = {
  if: "假如",
  "my-next-question": "我的下一个问题是",
  "will-you-pull": "你会不会拉下拉杆",
  "your-answer": "你的回答会",
  "same-as-this": "跟这个问题一样吗",
  "will-you-not-pull": "你会不会不拉下拉杆",
  "can-you-save-us": "你能救我们吗",
  "is-yes": "回答是吗",
};

export const CORRIDOR_BEATS = [
  "人蛇拉下拉杆。天花板缓缓下降，九人终于重新踏到地面。",
  "长廊两侧的门接连打开，血迹与腐烂的味道一起涌出。",
  "牛、马、狗、羊、蛇、鼠、鸡……齐夏只确定了一件事：这些是生肖。",
  "人龙出现。他给出十天与三千六百个道的规则。",
  "人龙把四颗道交给齐夏：说谎者、雨后春笋、天降死亡、是与非。",
  "门外的风吹来。九人向所谓的新世界走去。",
] as const;

export const HUMAN_DRAGON_DAO_BEAT = 4;

export const FAILURE_PRESENTATION: Record<
  ChapterTwoFailureId,
  { title: string; description: string; checkpoint: ChapterTwoCheckpointId }
> = {
  "harpoon-volley": {
    title: "座钟指向一点一刻",
    description: "你没有在鱼叉发射前闭合这场推演。四面皆有杀机。",
    checkpoint: "c2-b",
  },
  "shield-breach": {
    title: "锥体出现缺口",
    description: "鱼叉从未闭合的方向贯穿了防线。",
    checkpoint: "c2-c",
  },
  "han-pinned-to-wall": {
    title: "鱼叉被收回墙中",
    description: "韩一墨的绳索没有及时割断，回收机关把他拖向墙洞。",
    checkpoint: "c2-d",
  },
  "wall-position-crush": {
    title: "相信了羊的谎言",
    description: "你们贴墙等待，升起的地板把所有退路压成了死角。",
    checkpoint: "c2-e",
  },
  "floor-collapse": {
    title: "座钟指向一点半",
    description: "九块方板没有成为天花板上的生路，地板最终碎裂。",
    checkpoint: "c2-e",
  },
  "yes-no-exhausted": {
    title: "第三个问题结束",
    description: "人蛇没有被迫答应救人，木门在深坑下方关上。",
    checkpoint: "c2-f",
  },
};

export function initialCharacters(): Record<CharacterId, CharacterRuntimeState> {
  return {
    qixia: { alive: true, pose: "standing", injuries: [], stamina: 3 },
    qiao: { alive: true, pose: "standing", injuries: [], stamina: 3 },
    tiantian: { alive: true, pose: "standing", injuries: [], stamina: 2 },
    xiao: { alive: true, pose: "standing", injuries: [], stamina: 2 },
    zhao: { alive: true, pose: "standing", injuries: [], stamina: 2 },
    han: { alive: true, pose: "standing", injuries: [], stamina: 2 },
    zhang: { alive: true, pose: "standing", injuries: [], stamina: 2 },
    li: { alive: true, pose: "standing", injuries: [], stamina: 3 },
    lin: { alive: true, pose: "standing", injuries: [], stamina: 2 },
  };
}

export function applyCanonicalHarpoonInjuries(
  characters: Record<CharacterId, CharacterRuntimeState>,
): Record<CharacterId, CharacterRuntimeState> {
  return {
    ...characters,
    tiantian: {
      ...characters.tiantian,
      pose: "injured",
      injuries: ["tiantian-right-palm"],
      stamina: 1,
    },
    han: {
      ...characters.han,
      pose: "injured",
      injuries: ["han-shoulder-harpoon", "han-blood-loss"],
      stamina: 1,
    },
  };
}

export function error(
  scope: ChapterTwoPuzzleId,
  fieldId: string,
  code: string,
  message: string,
): FieldError {
  return { scope, fieldId, code, message };
}
