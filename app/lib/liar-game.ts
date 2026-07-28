export type LiarGamePhase =
  | "lobby"
  | "rules"
  | "identity"
  | "stories"
  | "deduction"
  | "vote"
  | "result";

export type LiarStory = {
  id: string;
  name: string;
  occupation: string;
  summary: string;
  testimony: string;
  followUp?: string;
  selfReflection?: string;
  clue: string;
};

export type LiarEvidenceKind = "人物" | "地点" | "事件" | "规则" | "案件";

export type LiarEvidence = {
  id: string;
  storyId: string | "renyang";
  kind: LiarEvidenceKind;
  label: string;
  text: string;
  source: string;
  availableAtStart?: boolean;
};

export type LiarDeduction = {
  id: string;
  title: string;
  description: string;
  requiredEvidence: readonly string[];
  requiresDeductions?: readonly string[];
  result: string;
};

export const LIAR_GAME = {
  id: "renyang-liar-canon-001",
  title: "说谎者",
  host: "人羊",
  location: "面试房",
  clock: "12:00",
  participantCount: 9,
  chamber: {
    widthMeters: 4,
    lengthMeters: 4,
    heightMeters: 3,
  },
  rules: [
    "九位参与者依次讲述抵达此处前最后发生的事。",
    "讲述者中有且只有一位说谎者；身份牌要求抽到“说谎者”的人必须说谎。",
    "全部讲述结束后，九人分别在纸上写下一名投票对象。",
    "八位参与者必须全部选中唯一的说谎者；任意一票错误，则说谎者存活，其余参与者出局。",
  ],
  stories: [
    {
      id: "tiantian",
      name: "甜甜",
      occupation: "陪酒小姐",
      summary: "她在车内接待客人时遭遇地震，广告牌坠落，随后失去意识。",
      testimony: "我是在车里上班的，客人的手机一直响。我还以为是动作太大才晃得厉害，后来才知道是地震……我把头探出车外，就看见广告牌砸下来，之后我什么都不知道了。",
      followUp: "你说你在车内接待客人时，把头伸到车外；广告牌砸在车上之后，你真的只是失去意识了吗？",
      clue: "陕西、广告牌、地震。她将“死亡”说成了“失去意识”。",
    },
    {
      id: "qiao",
      name: "乔家劲",
      occupation: "收债人",
      summary: "他讲述债主声称被人骗走二百万，随后在追债时遭遇地震，从天台坠向广告牌后失去意识。",
      testimony: "我叫乔家劲，广东人，是个收债的。那个粉肠借了钱却不还，到处说自己被人骗走了二百万。昨晚我把他带到高楼天台，地震时他把我推下去，我撞上广告牌，后面的事记不清了。",
      followUp: "乔家劲，你从那么高的地方摔到了广告牌上，真的只是失去意识而已吗？",
      clue: "广东、被诈骗二百万、收债人与广告牌。乔家劲第一次把这笔钱和债主放在同一段叙述里。",
    },
    {
      id: "xiao",
      name: "肖冉",
      occupation: "幼师",
      summary: "她讲述陪孩子等家长时遭遇地震，试图躲避失控车辆后昏迷。",
      testimony: "我陪孩子等家长，地面一晃，车就失控冲了过来。我想躲开，接着什么都不知道了。",
      followUp: "失控车辆冲来时，孩子在哪里？你为什么只说自己失去意识，没有说出之后发生了什么？",
      clue: "云南大理、崇圣寺三塔、失控车辆。她回避了死亡结局。",
    },
    {
      id: "zhao",
      name: "赵海博",
      occupation: "医生",
      summary: "他讲述在手术中遇到地震，处理病人后被医疗推车撞倒。",
      testimony: "手术还没结束，地震就来了。我先去处理病人，后来被冲过来的医疗推车撞倒，醒来就在这里。",
      followUp: "手术室坍塌、病人和医疗推车同时失控，你为什么只把结局说成一次撞倒？",
      clue: "江苏、脑部手术、坍塌。所有叙述都将致命结果替换成昏迷。",
    },
    {
      id: "han",
      name: "韩一墨",
      occupation: "网络小说作家",
      summary: "他讲述自己正写结局，对地震与抵达此处的过程几乎没有印象。",
      testimony: "我本来在写小说的结局。地震？我记不清了，连自己是怎么来到这里的都不知道。",
      followUp: "你对其他细节都有判断，为什么偏偏对地震和来到这里的过程完全没有印象？",
      clue: "独立叙述并非无关；“不知道”本身遮蔽了死亡经过。",
    },
    {
      id: "zhang",
      name: "章晨泽",
      occupation: "律师",
      summary: "她讲述当事人被骗二百万元，随后在成都开车前往会面时，地裂与追尾将车辆卷入裂缝。",
      testimony: "我叫章晨泽，是律师。我的当事人被骗走了二百万元，案子金额很大。地震时我正开车去见他，路面突然裂开，后面的车连续追尾，把车顶进裂缝，随后我失去意识。",
      followUp: "章律师，你的车子被撞入了裂缝，那个裂缝有多深？",
      clue: "四川、当事人被骗二百万元、诈骗案。她把金额、案件和坠入地裂说在了证词里。",
    },
    {
      id: "li",
      name: "李尚武",
      occupation: "刑警",
      summary: "他讲述蹲守涉案二百万元的诈骗犯时遭遇地震，被人从后座勒住并遭到重击。",
      testimony: "我叫李尚武，是内蒙的刑警。我们在车里蹲守一个诈骗犯，涉案金额高达二百万元。地震一来，后座有人勒住了我，后来脑后挨了一下，再醒来就是这里。",
      followUp: "李警官，你开的是什么牌子的车？能够瞬间将座椅放倒，挣脱身后人的束缚吗？",
      clue: "内蒙、涉案二百万元的诈骗犯、颈部勒痕。他与章晨泽说的是同一金额，却给出了不同的案件进度。",
    },
    {
      id: "lin",
      name: "林檎",
      occupation: "心理咨询师",
      summary: "她讲述高层工作室在地震中发生坍塌，自己因此失去意识。",
      testimony: "工作室在高层，地震一来，整栋楼都在塌。我只记得自己被砸倒，之后就没意识了。",
      followUp: "高层工作室发生坍塌后，楼体结构与逃生路径都已经断裂；你为什么认为自己只是失去意识？",
      clue: "宁夏、高层坍塌。大楼结构与她的生还说法并不相容。",
    },
    {
      id: "qixia",
      name: "齐夏",
      occupation: "职业骗子",
      summary: "作为玩家视角，齐夏没有使用准备好的化名，而是公开职业骗子的身份，讲述自己洗钱后遭遇地震、冲入房屋并被倒塌门廊压住。",
      testimony: "我叫齐夏，山东人，是个职业骗子。来这里之前，我在洗手里的二百万，最后到手一百四十万。拿钱回家的路上地震了，我担心屋里的人，冲进房间时门廊倒塌，把我压住，随后失去了意识。",
      selfReflection: "我冲进不断摇晃的房子时，倒塌的门廊把我压在下面。我也不可能只是失去意识。",
      clue: "齐夏公开的内容：山东、二百万、洗钱后一百四十万、摇晃的房屋与倒塌门廊。身份牌仍被他扣在桌上；他只承认自己是职业骗子，没有承认抽到“说谎者”。",
    },
  ] satisfies LiarStory[],
  suspects: [
    { id: "renyang", name: "人羊", type: "host" },
    { id: "tiantian", name: "甜甜", type: "participant" },
    { id: "qiao", name: "乔家劲", type: "participant" },
    { id: "xiao", name: "肖冉", type: "participant" },
    { id: "zhao", name: "赵海博", type: "participant" },
    { id: "han", name: "韩一墨", type: "participant" },
    { id: "zhang", name: "章晨泽", type: "participant" },
    { id: "li", name: "李尚武", type: "participant" },
    { id: "lin", name: "林檎", type: "participant" },
    { id: "qixia", name: "齐夏", type: "participant" },
  ],
} as const;

export const CANONICAL_LIAR_TARGET = "renyang";

// Every card is tied to a concrete first-trial statement. The client may only
// reveal a card after the corresponding testimony has been recorded.
export const LIAR_EVIDENCE: readonly LiarEvidence[] = [
  {
    id: "rule-exclusive-liar",
    storyId: "renyang",
    kind: "规则",
    label: "有且只有一位说谎者",
    text: "人羊把条件限定在“讲故事的人”之中，并宣称其中有且只有一位说谎者。",
    source: "原文锚点：人羊公布“说谎者”规则",
    availableAtStart: true,
  },
  {
    id: "host-story",
    storyId: "renyang",
    kind: "规则",
    label: "人羊的造神叙述",
    text: "人羊讲述自己将众人聚集到这里，是为了创造一个“神”。",
    source: "原文锚点：人羊开场叙述",
    availableAtStart: true,
  },
  {
    id: "tiantian-terminal",
    storyId: "tiantian",
    kind: "事件",
    label: "广告牌坠向车顶",
    text: "甜甜把广告牌砸向车辆后的结局说成“失去意识”。",
    source: "原文锚点：甜甜的面试房叙述",
  },
  {
    id: "qiao-money",
    storyId: "qiao",
    kind: "案件",
    label: "债主被骗走二百万元",
    text: "乔家劲追讨的债主声称自己被人骗走二百万元。",
    source: "原文锚点：乔家劲的面试房叙述",
  },
  {
    id: "qiao-terminal",
    storyId: "qiao",
    kind: "事件",
    label: "天台与广告牌",
    text: "乔家劲从高处坠向广告牌后，也把结局说成“失去意识”。",
    source: "原文锚点：乔家劲的面试房叙述",
  },
  {
    id: "xiao-terminal",
    storyId: "xiao",
    kind: "事件",
    label: "失控车辆",
    text: "肖冉在地震中面对失控车辆，却回避了自己与孩子之后的结局。",
    source: "原文锚点：肖冉的面试房叙述",
  },
  {
    id: "zhao-terminal",
    storyId: "zhao",
    kind: "事件",
    label: "手术室坍塌",
    text: "赵海博把坍塌与医疗推车造成的结果简化为“撞倒”。",
    source: "原文锚点：赵海博的面试房叙述",
  },
  {
    id: "han-terminal",
    storyId: "han",
    kind: "事件",
    label: "对抵达过程的空白",
    text: "韩一墨称自己记不清地震，也不知道自己如何抵达这里。",
    source: "原文锚点：韩一墨的面试房叙述",
  },
  {
    id: "zhang-money",
    storyId: "zhang",
    kind: "案件",
    label: "当事人被骗二百万元",
    text: "章晨泽整理的开庭资料，涉及一名被诈骗二百万元的当事人。",
    source: "原文锚点：章晨泽的面试房叙述",
  },
  {
    id: "zhang-trial",
    storyId: "zhang",
    kind: "案件",
    label: "案件已进入开庭准备",
    text: "章晨泽正在整理开庭资料；她的叙述默认嫌疑人已进入可审理阶段。",
    source: "原文锚点：章晨泽的面试房叙述",
  },
  {
    id: "zhang-terminal",
    storyId: "zhang",
    kind: "事件",
    label: "车辆坠入地裂",
    text: "章晨泽把地裂、追尾与坠入裂缝后的结局说成“失去意识”。",
    source: "原文锚点：章晨泽的面试房叙述",
  },
  {
    id: "li-money",
    storyId: "li",
    kind: "案件",
    label: "涉案金额二百万元",
    text: "李尚武正在蹲守一名涉案金额高达二百万元的诈骗嫌疑人。",
    source: "原文锚点：李尚武的面试房叙述",
  },
  {
    id: "li-stakeout",
    storyId: "li",
    kind: "案件",
    label: "嫌疑人仍在蹲守范围",
    text: "李尚武的行动表明，嫌疑人在他的叙述里尚未落网。",
    source: "原文锚点：李尚武的面试房叙述",
  },
  {
    id: "li-terminal",
    storyId: "li",
    kind: "事件",
    label: "勒痕与重击",
    text: "李尚武在震后被勒住并遭到重击，仍将之后说成“再醒来就是这里”。",
    source: "原文锚点：李尚武的面试房叙述",
  },
  {
    id: "lin-terminal",
    storyId: "lin",
    kind: "事件",
    label: "高层工作室坍塌",
    text: "林檎所处的高层工作室发生坍塌，她同样只说自己失去意识。",
    source: "原文锚点：林檎的面试房叙述",
  },
  {
    id: "qixia-money",
    storyId: "qixia",
    kind: "案件",
    label: "齐夏手中的二百万元",
    text: "齐夏承认自己正在处理手里的二百万元，最后到手一百四十万。",
    source: "原文锚点：齐夏的面试房叙述",
  },
  {
    id: "qixia-terminal",
    storyId: "qixia",
    kind: "事件",
    label: "倒塌门廊",
    text: "齐夏冲进房屋后被倒塌门廊压住，也将结局停在“失去意识”。",
    source: "原文锚点：齐夏的面试房叙述",
  },
] as const;

export const LIAR_DEDUCTIONS: readonly LiarDeduction[] = [
  {
    id: "money-chain",
    title: "二百万元的共用链条",
    description: "将债主、律师、刑警与齐夏的金额记录并置。",
    requiredEvidence: ["qiao-money", "zhang-money", "li-money", "qixia-money"],
    result: "四段叙述中的二百万元并非独立数字，它们指向同一条诈骗案件链。",
  },
  {
    id: "case-timeline",
    title: "案件进度矛盾",
    description: "比较“准备开庭”与“仍在蹲守”是否能同时成立。",
    requiredEvidence: ["zhang-trial", "li-stakeout"],
    result: "同一名嫌疑人在章晨泽的叙述中可被审理，在李尚武的叙述中却仍未落网。",
  },
  {
    id: "survival-wording",
    title: "九人共同回避的结局",
    description: "把每个人对灾难结尾的表述放进同一条记录。",
    requiredEvidence: [
      "tiantian-terminal",
      "qiao-terminal",
      "xiao-terminal",
      "zhao-terminal",
      "han-terminal",
      "zhang-terminal",
      "li-terminal",
      "lin-terminal",
      "qixia-terminal",
    ],
    result: "九段叙述都以不同方式遮蔽了死亡；“失去意识”并不能解释他们为何同时坐在面试房中。",
  },
  {
    id: "rule-boundary",
    title: "把规则写回讲述者范围",
    description: "在九人的共同谎言与人羊的开场叙述之间，重新检查规则的主语。",
    requiredEvidence: ["rule-exclusive-liar", "host-story"],
    requiresDeductions: ["survival-wording"],
    result: "当九位参与者的叙述都无法按表面成立时，唯一能被规则百分之百锁定的对象并不在九人之内。",
  },
] as const;

export const LIAR_EVIDENCE_BY_ID = Object.freeze(
  Object.fromEntries(LIAR_EVIDENCE.map((evidence) => [evidence.id, evidence])) as Record<string, LiarEvidence>,
);

export function evidenceForStory(storyId: string): readonly LiarEvidence[] {
  return LIAR_EVIDENCE.filter((evidence) => evidence.storyId === storyId);
}

export function deductionIsSupported(
  deduction: LiarDeduction,
  recordedEvidence: ReadonlySet<string>,
  completedDeductions: ReadonlySet<string>,
) {
  return deduction.requiredEvidence.every((id) => recordedEvidence.has(id))
    && (deduction.requiresDeductions ?? []).every((id) => completedDeductions.has(id));
}

export function chamberVolume(): number {
  return LIAR_GAME.chamber.widthMeters * LIAR_GAME.chamber.lengthMeters * LIAR_GAME.chamber.heightMeters;
}

export function resolveCanonicalVote(targetId: string | null) {
  const isCorrect = targetId === CANONICAL_LIAR_TARGET;

  return {
    isCorrect,
    target: LIAR_GAME.suspects.find((suspect) => suspect.id === targetId) ?? null,
    outcome: isCorrect ? "participants-survive" : "liar-survives",
  } as const;
}
