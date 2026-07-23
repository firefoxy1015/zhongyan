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
      clue: "陕西、广告牌、地震。她将“死亡”说成了“失去意识”。",
    },
    {
      id: "qiao",
      name: "乔家劲",
      occupation: "收债人",
      summary: "他讲述追债时遭遇地震，从天台坠向广告牌后失去意识。",
      testimony: "我在天台追债，地震把楼都晃开了。我从上面掉下去，撞上广告牌，然后就断片了。",
      clue: "广东、二百万、广告牌。生还描述与坠落后果并不相称。",
    },
    {
      id: "xiao",
      name: "肖冉",
      occupation: "幼师",
      summary: "她讲述陪孩子等家长时遭遇地震，试图躲避失控车辆后昏迷。",
      testimony: "我陪孩子等家长，地面一晃，车就失控冲了过来。我想躲开，接着什么都不知道了。",
      clue: "云南大理、崇圣寺三塔、失控车辆。她回避了死亡结局。",
    },
    {
      id: "zhao",
      name: "赵海博",
      occupation: "医生",
      summary: "他讲述在手术中遇到地震，处理病人后被医疗推车撞倒。",
      testimony: "手术还没结束，地震就来了。我先去处理病人，后来被冲过来的医疗推车撞倒，醒来就在这里。",
      clue: "江苏、脑部手术、坍塌。所有叙述都将致命结果替换成昏迷。",
    },
    {
      id: "han",
      name: "韩一墨",
      occupation: "网络小说作家",
      summary: "他讲述自己正写结局，对地震与抵达此处的过程几乎没有印象。",
      testimony: "我本来在写小说的结局。地震？我记不清了，连自己是怎么来到这里的都不知道。",
      clue: "独立叙述并非无关；“不知道”本身遮蔽了死亡经过。",
    },
    {
      id: "zhang",
      name: "章晨泽",
      occupation: "律师",
      summary: "她讲述在成都开车前往会见当事人，地裂与追尾将车辆卷入裂缝。",
      testimony: "我开车去见当事人，路面突然裂开，后面的车也撞了上来。车掉进裂缝以后，我就失去意识了。",
      clue: "四川、二百万、诈骗案。坠入裂缝后不可能只是失去意识。",
    },
    {
      id: "li",
      name: "李尚武",
      occupation: "刑警",
      summary: "他讲述蹲守诈骗犯时遭遇地震，被人从后座勒住并遭到重击。",
      testimony: "我在车里蹲守诈骗犯，地震一来，后座有人勒住了我。后来脑后挨了一下，再醒来就是这里。",
      clue: "内蒙、诈骗案、颈部勒痕。车辆与脱身方式存在不自然之处。",
    },
    {
      id: "lin",
      name: "林檎",
      occupation: "心理咨询师",
      summary: "她讲述高层工作室在地震中发生坍塌，自己因此失去意识。",
      testimony: "工作室在高层，地震一来，整栋楼都在塌。我只记得自己被砸倒，之后就没意识了。",
      clue: "宁夏、高层坍塌。大楼结构与她的生还说法并不相容。",
    },
    {
      id: "qixia",
      name: "齐夏",
      occupation: "职业骗子",
      summary: "他讲述自己处理二百万赃款后遇到地震，冲进房屋寻找重要之人时被坍塌物压住。",
      testimony: "我刚处理完那笔钱，地震就来了。我冲进屋里找人，房子塌下来压住了我。后面的事，我也说不清。",
      clue: "山东、二百万、坍塌。他主动承认身份牌为“说谎者”。",
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
