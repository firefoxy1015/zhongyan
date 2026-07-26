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
      followUp: "你说债主被人骗走二百万，又在天台把你推下去。这个人和后面几段故事里的诈骗犯，到底是不是同一个？",
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
      followUp: "你要见的当事人被骗二百万元；乔家劲追的债主、李警官蹲守的嫌疑人，是否都指向同一笔钱？",
      clue: "四川、当事人被骗二百万元、诈骗案。她把金额、案件和坠入地裂说在了证词里。",
    },
    {
      id: "li",
      name: "李尚武",
      occupation: "刑警",
      summary: "他讲述蹲守涉案二百万元的诈骗犯时遭遇地震，被人从后座勒住并遭到重击。",
      testimony: "我叫李尚武，是内蒙的刑警。我们在车里蹲守一个诈骗犯，涉案金额高达二百万元。地震一来，后座有人勒住了我，后来脑后挨了一下，再醒来就是这里。",
      followUp: "你蹲守的是涉案二百万元的诈骗犯。章律师已经在准备开庭，嫌疑人到底是还没落网，还是已经被抓了？",
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
      selfReflection: "我原本准备化名“李明”，但没有这么做。乔家劲、章晨泽、李尚武和我的故事都指向同一个骗子和同一笔二百万；我公开职业和经历，是为了验证这些故事的连接，不是承认身份牌。",
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
