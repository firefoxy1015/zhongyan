export const CANON_MANIFEST = {
  source: {
    title: "十日终焉 1--1496 完结 杀虫队队员.txt",
    sha256: "CE65EEC84123E2DAB72EDE9C13A0E91C7F7B1A803356A701148A178FEFE892E1",
    storyUnits: 1496,
    mainStoryUnits: 1359,
    extras: 136,
    postscript: 1,
  },
  volumes: [
    { id: 1, title: "我听到了你们", range: "1–91" },
    { id: 2, title: "我看到了你们", range: "92–190" },
    { id: 3, title: "我想要见你们", range: "191–300" },
    { id: 4, title: "我来找你们了", range: "301–440" },
    { id: 5, title: "我很失望", range: "441–557" },
    { id: 6, title: "准备认输了吗？", range: "558–684" },
    { id: 7, title: "这样才对啊", range: "685–808" },
    { id: 8, title: "来吧，来找我", range: "809–926" },
    { id: 9, title: "我将和你见证", range: "927–1105" },
    { id: 10, title: "这一切的终焉", range: "1106–1358" },
  ],
  initialGames: ["说谎者", "仓库寻道", "地牛关卡", "送信游戏", "跷跷板"],
} as const;

export const PROLOGUE_STEPS = [
  {
    chapter: 1,
    phase: "面试房",
    title: "空屋",
    heading: "座钟指向十二点",
    body: "昏暗的钨丝灯悬在圆桌上方。沉睡的陌生人依次醒来，房间没有门，墙面与地板被整齐的线条切割。山羊面具的主持者首先开口，而人数与称呼之间出现了第一处矛盾。",
    reference: "原文锚点：第1章 · 空屋",
    actions: ["观察座钟", "清点人数", "询问山羊头"],
    action: "观察座钟",
    nextLabel: "确认异常",
  },
  {
    chapter: 2,
    phase: "规则公布",
    title: "说谎",
    heading: "第一张身份牌",
    body: "主持者向每个参与者放下一张纸牌，并宣告第一场游戏开始。规则被写得足够简短，却留下了可以吞没所有人的解释空间。此时，每句话都可能是线索，也可能是陷阱。",
    reference: "原文锚点：第2章 · 说谎",
    actions: ["查看身份牌", "记录规则措辞", "保持沉默"],
    action: "查看身份牌",
    nextLabel: "进入首轮讨论",
  },
  {
    chapter: 7,
    phase: "推理阶段",
    title: "赢面",
    heading: "规则绝对，解释未必如此",
    body: "叙述、投票与身份牌相互纠缠。原著模式不会提前展示正确答案：系统只保留角色此刻能够知道的信息，并在每次发言后更新公开记录与私密推断。",
    reference: "原文锚点：第7章 · 赢面",
    actions: ["比对叙述", "标记矛盾", "等待他人发言"],
    action: "比对叙述",
    nextLabel: "推进正史节点",
  },
  {
    chapter: 10,
    phase: "结算",
    title: "结束了？",
    heading: "第一场游戏结束之后",
    body: "结算不会终止故事。面试房之外的终焉之地、十日循环、生肖游戏与“道”的规则即将逐层显现。失败路线会保存为非正史记录，成功路线才会解锁下一段原著章节。",
    reference: "原文锚点：第10章 · 结束了？",
    actions: ["查看结算", "记录幸存者", "进入终焉之地"],
    action: "查看结算",
    nextLabel: "回到空屋",
  },
] as const;

export const PROLOGUE_PLAYERS = [
  { name: "齐夏", role: "观察中", token: "齐", status: "" },
  { name: "乔家劲", role: "警戒中", token: "乔", status: "" },
  { name: "林檎", role: "观察中", token: "林", status: "" },
  { name: "李警官", role: "记录规则", token: "李", status: "waiting" },
  { name: "赵医生", role: "等待发言", token: "赵", status: "waiting" },
  { name: "其余参与者", role: "身份未公开", token: "？", status: "waiting" },
] as const;

export const OFFICIAL_REFERENCES = [
  {
    id: "book",
    label: "实体书与官方出版物：标题、封面、卷册语汇",
    href: "https://opac.lib.uibe.edu.cn/opac/book/08772de8be556ddf4c032002f8035043",
  },
  {
    id: "animation",
    label: "官方动画PV：人物、生肖、环境与回响表现",
    href: "https://weibo.com/2591595652/5312612583604911",
  },
  {
    id: "drama",
    label: "官方剧集物料：建筑、服化道与写实材质",
    href: "https://weibo.com/2591595652/5286133916766866",
  },
] as const;
