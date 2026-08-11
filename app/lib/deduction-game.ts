export type RoomClueId =
  | "identity"
  | "host-account"
  | "wall-grid"
  | "clock"
  | "occupants"
  | "air-rate"
  | "headless-body";

export type RoomClue = {
  id: RoomClueId;
  label: string;
  eyebrow: string;
  observation: string;
  note: string;
};

export const ROOM_CLUES: readonly RoomClue[] = [
  {
    id: "identity",
    label: "扣住的身份牌",
    eyebrow: "PRIVATE / 仅齐夏可见",
    observation: "牌面写着「说谎者」。这只能证明齐夏必须说谎，不能证明别人一定说了真话。",
    note: "我的牌是「说谎者」。规则仍然需要单独验证。",
  },
  {
    id: "host-account",
    label: "人羊说过的话",
    eyebrow: "HOST STATEMENT",
    observation: "人羊说众人已经沉睡十二小时；他还说，把众人聚在这里是为了创造一个「神」。",
    note: "十二小时沉睡；人羊也讲过一段关于「创造神」的故事。",
  },
  {
    id: "wall-grid",
    label: "墙面与地板刻线",
    eyebrow: "ROOM GEOMETRY",
    observation: "刻线间距几乎相同，每格边长约一米。墙面竖向三格、横向四格；地面相邻的两条边各有四格。",
    note: "每格约一米；墙面竖三横四，地面相邻两边各四格。",
  },
  {
    id: "clock",
    label: "桌中央的座钟",
    eyebrow: "ELAPSED TIME",
    observation: "人羊宣布游戏开始时是十二点。现在分针已经转过大半圈，时针正向一点逼近。",
    note: "游戏从十二点开始，座钟正在逼近一点；还要结合人羊声称的沉睡时间。",
  },
  {
    id: "occupants",
    label: "桌边的人数",
    eyebrow: "HEAD COUNT",
    observation: "沿桌边逐一数去，参与游戏的共有九人；人羊站在桌外，同样一直在呼吸和说话。",
    note: "桌边有九名参与者；桌外还站着人羊。",
  },
  {
    id: "air-rate",
    label: "齐夏的常识",
    eyebrow: "MENTAL NOTE",
    observation: "齐夏记得，正常人每分钟大约需要消耗 0.007 立方米空气。草稿要求的是每小时用量。",
    note: "正常人每分钟约消耗 0.007 立方米空气；需要自行换算成每小时。",
  },
  {
    id: "headless-body",
    label: "桌边的无头尸体",
    eyebrow: "PHYSICAL IMPOSSIBILITY",
    observation: "人羊曾单手击碎人的头骨。这样的力量不属于正常人类。",
    note: "人羊单手击碎过人的头骨；他是否属于正常人类需要单独验证。",
  },
] as const;

export type CrossExamination = {
  storyId: string;
  options: readonly string[];
  answer: string;
  reaction: string;
};

export const CROSS_EXAMINATIONS: readonly CrossExamination[] = [
  {
    storyId: "tiantian",
    options: ["她是否真的叫甜甜", "广告牌砸下后的结局", "陕西也发生了地震"],
    answer: "广告牌砸下后的结局",
    reaction: "甜甜抿住嘴唇，没有回答。",
  },
  {
    storyId: "qiao",
    options: ["债主被骗的二百万", "广东与陕西的距离", "从高楼坠落后的结局"],
    answer: "从高楼坠落后的结局",
    reaction: "乔家劲沉默了。",
  },
  {
    storyId: "xiao",
    options: ["崇圣寺三塔的位置", "幼儿园孩子的身份", "疾行汽车撞来后的结局"],
    answer: "疾行汽车撞来后的结局",
    reaction: "肖冉的眼神闪躲了一下。",
  },
  {
    storyId: "zhao",
    options: ["医生为什么隐瞒家乡", "脑部手术的病人", "手术室坍塌后的结局"],
    answer: "手术室坍塌后的结局",
    reaction: "赵海博把头扭到一边。",
  },
  {
    storyId: "han",
    options: ["小说的大结局", "为何完全不知道抵达过程", "网络作家的真实姓名"],
    answer: "为何完全不知道抵达过程",
    reaction: "韩一墨微微叹了口气。",
  },
  {
    storyId: "zhang",
    options: ["当事人的二百万元", "青羊大道的路线", "车辆坠入裂缝后的结局"],
    answer: "车辆坠入裂缝后的结局",
    reaction: "章晨泽双手环抱，面无表情。",
  },
  {
    storyId: "li",
    options: ["嫌疑人是否已经落网", "涉案的二百万元", "被勒住并重击后的结局"],
    answer: "被勒住并重击后的结局",
    reaction: "李尚武摸了摸颈部的红色勒痕，欲言又止。",
  },
  {
    storyId: "lin",
    options: ["她与肖冉的关系", "工作室所在城市", "高层楼体坍塌后的结局"],
    answer: "高层楼体坍塌后的结局",
    reaction: "林檎深深低下了头。",
  },
  {
    storyId: "qixia",
    options: ["原本准备使用的化名", "洗钱后的实际所得", "门廊压下后的结局"],
    answer: "门廊压下后的结局",
    reaction: "齐夏无法骗过自己：倒塌的门廊不会只让人昏迷。",
  },
] as const;

export type DeductionPuzzleId = "case-thread" | "air-ledger" | "last-moment" | "rule-reversal";

export const RULE_REVERSAL_PREREQUISITES = ["case-thread", "air-ledger", "last-moment"] as const satisfies readonly DeductionPuzzleId[];

export function ruleReversalIsAvailable(solvedPuzzles: ReadonlySet<DeductionPuzzleId>) {
  return RULE_REVERSAL_PREREQUISITES.every((puzzleId) => solvedPuzzles.has(puzzleId));
}

export type DeductionSlot = {
  id: string;
  options: readonly string[];
  answer: string;
};

export type DeductionPuzzle = {
  id: DeductionPuzzleId;
  tab: string;
  title: string;
  slots: readonly DeductionSlot[];
  success: string;
};

export const DEDUCTION_PUZZLES: readonly DeductionPuzzle[] = [
  {
    id: "case-thread",
    tab: "草稿甲",
    title: "四段故事里反复出现的数字",
    slots: [
      { id: "qiao", options: ["一百四十万", "二百万", "五百万"], answer: "二百万" },
      { id: "zhang", options: ["二百万", "四十八万", "金额不明"], answer: "二百万" },
      { id: "li", options: ["五十万", "二百万", "一百四十万"], answer: "二百万" },
      { id: "qixia", options: ["二百万", "一百四十万", "没有钱"], answer: "二百万" },
      {
        id: "timeline",
        options: ["证明其中一人说谎", "看似矛盾但不能百分百定罪", "四件完全无关的事"],
        answer: "看似矛盾但不能百分百定罪",
      },
    ],
    success: "二百万把四段故事连在一起，开庭与蹲守也互相冲突；但他们身处不同城市，这仍不是百分之百的证据。",
  },
  {
    id: "air-ledger",
    tab: "草稿乙",
    title: "密闭房间里的空气账",
    slots: [
      { id: "length", options: ["3", "4", "9"], answer: "4" },
      { id: "width", options: ["4", "10", "13"], answer: "4" },
      { id: "height", options: ["1", "3", "4"], answer: "3" },
      { id: "people", options: ["8", "9", "10"], answer: "10" },
      { id: "hours", options: ["1", "12", "13"], answer: "13" },
      { id: "rate", options: ["0.007", "0.42", "4.2"], answer: "0.42" },
      { id: "withoutHost", options: ["8", "9", "10"], answer: "9" },
    ],
    success: "房间只有 48 立方米；十人应消耗 54.6，排除人羊后的九人也应消耗 49.14。现实不该允许所有人依然毫无缺氧反应。",
  },
  {
    id: "last-moment",
    tab: "草稿丙",
    title: "九段故事共同避开的词",
    slots: [
      { id: "subject", options: ["四个人", "八个人", "九名参与者"], answer: "九名参与者" },
      { id: "truth", options: ["只是昏迷", "都已经死亡", "从未遭遇地震"], answer: "都已经死亡" },
      { id: "wording", options: ["失去意识", "来到这里", "互不相识"], answer: "失去意识" },
      { id: "verdict", options: ["九人都说了谎", "只有齐夏说谎", "故事彼此无关"], answer: "九人都说了谎" },
    ],
    success: "广告牌、坠楼、失控车辆、坍塌、地裂、勒杀与倒塌门廊指向同一件事：九人都已死亡，却把死亡说成了失去意识。",
  },
  {
    id: "rule-reversal",
    tab: "纸背",
    title: "把规则的主语重新读一遍",
    slots: [
      { id: "narrator", options: ["齐夏", "人羊", "李尚武"], answer: "人羊" },
      {
        id: "story",
        options: ["聚集众人是为了创造神", "自己只是失去意识", "诈骗金额是二百万"],
        answer: "聚集众人是为了创造神",
      },
      { id: "scope", options: ["裁判", "讲故事的人", "没有参与游戏的人"], answer: "讲故事的人" },
      { id: "certain", options: ["乔家劲", "齐夏", "人羊"], answer: "人羊" },
    ],
    success: "人羊也讲了故事。九名参与者都说谎，与“有且只有一个说谎者”无法同时成立；唯一能够百分之百写下的名字是人羊。",
  },
] as const;

export const PUZZLE_BY_ID = Object.freeze(
  Object.fromEntries(DEDUCTION_PUZZLES.map((puzzle) => [puzzle.id, puzzle])) as Record<DeductionPuzzleId, DeductionPuzzle>,
);

export function puzzleErrorCount(puzzle: DeductionPuzzle, answers: Readonly<Record<string, string>>) {
  return puzzle.slots.reduce((errors, slot) => errors + (answers[slot.id] === slot.answer ? 0 : 1), 0);
}
