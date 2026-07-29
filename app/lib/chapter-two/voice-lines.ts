import { CHARACTER_VOICE_PROFILES, type CharacterVoiceId } from "../testimony-speech.ts";
import type { ChapterTwoSceneId } from "./types.ts";

export type ChapterTwoVoiceSpeakerId = CharacterVoiceId | "renshe" | "renlong";

export const CHAPTER_TWO_VOICE_PROFILES = {
  ...CHARACTER_VOICE_PROFILES,
  renshe: {
    label: "人蛇",
    model: "doubao-tts-2.0",
    voiceId: "zh_male_dayi_uranus_bigtts",
    gender: "男",
    timbre: "低温裁定者 2.0",
    deliveryDirection: "成年男性，平稳、冷淡、低温感，宣布规则时不提高音量。",
  },
  renlong: {
    label: "人龙",
    model: "doubao-tts-2.0",
    voiceId: "zh_male_liufei_uranus_bigtts",
    gender: "男",
    timbre: "腐朽宣告者 2.0",
    deliveryDirection: "成年男性，低沉、缓慢、带轻微戏谑和腐朽感，不咆哮。",
  },
} as const;

export const CHAPTER_TWO_VOICE_VERSIONS: Record<ChapterTwoVoiceSpeakerId, string> = {
  tiantian: "tiantian-locked-v2",
  qiao: "qiao-hk-clone-v1",
  xiao: "xiao-locked-v2",
  zhao: "zhao-locked-v2",
  han: "han-locked-v2",
  zhang: "zhang-locked-v2",
  li: "li-locked-v2",
  lin: "lin-locked-v2",
  qixia: "qixia-locked-v2",
  renshe: "renshe-locked-v1",
  renlong: "renlong-locked-v1",
};

export const CHAPTER_TWO_VOICE_LINES = [
  {
    id: "c02-qixia-001",
    scene: "aftermath",
    speakerId: "qixia",
    text: "羊头人之所以选择自己的心脏开枪，八成是为了保护某样东西，游戏恐怕还未结束。",
    sourceRef: { chapter: 11, lineStart: 1281, lineEnd: 1281 },
  },
  {
    id: "c02-qiao-001",
    scene: "aftermath",
    speakerId: "qiao",
    text: "你是说……他怕打坏自己的面具？",
    sourceRef: { chapter: 11, lineStart: 1283, lineEnd: 1283 },
  },
  {
    id: "c02-qiao-002",
    scene: "aftermath",
    speakerId: "qiao",
    text: "我是人狗。你们受了诅咒。我希望你们活下去。时钟一刻不停，四面皆有杀机。若想活下去，请往家乡的方向转动一百次。对了，都说雨后春笋，为什么春笋不怕雨打？雨后见。",
    sourceRef: { chapter: 11, lineStart: 1297, lineEnd: 1309 },
  },
  {
    id: "c02-qixia-002",
    scene: "hometown-map",
    speakerId: "qixia",
    text: "快停下来，向右转。",
    sourceRef: { chapter: 12, lineStart: 1565, lineEnd: 1565 },
  },
  {
    id: "c02-qixia-003",
    scene: "shield-assembly",
    speakerId: "qixia",
    text: "警官，把大桌板丢掉，你去拿最后一块小桌板，所有人尖头朝上！",
    sourceRef: { chapter: 13, lineStart: 1753, lineEnd: 1753 },
  },
  {
    id: "c02-li-001",
    scene: "shield-assembly",
    speakerId: "li",
    text: "撑住！鱼叉数量有限，再撑一会儿我们就活下去了！",
    sourceRef: { chapter: 14, lineStart: 1795, lineEnd: 1795 },
  },
  {
    id: "c02-qixia-004",
    scene: "harpoon-rescue",
    speakerId: "qixia",
    text: "都像我这样做！我们至少要留下一枚鱼叉。",
    sourceRef: { chapter: 15, lineStart: 1981, lineEnd: 1981 },
  },
  {
    id: "c02-lin-001",
    scene: "harpoon-rescue",
    speakerId: "lin",
    text: "我好了！谁力气大，快去帮忙割断作家的绳子。",
    sourceRef: { chapter: 15, lineStart: 2003, lineEnd: 2003 },
  },
  {
    id: "c02-qiao-003",
    scene: "harpoon-rescue",
    speakerId: "qiao",
    text: "我丢，还没好吗？你慢吞吞，要害死这个粉肠了！",
    sourceRef: { chapter: 15, lineStart: 2031, lineEnd: 2031 },
  },
  {
    id: "c02-qixia-005",
    scene: "sky-death",
    speakerId: "qixia",
    text: "这段话全都是谎言！站在墙边会死，站在孔洞下面才是生！",
    sourceRef: { chapter: 17, lineStart: 2271, lineEnd: 2271 },
  },
  {
    id: "c02-qiao-004",
    scene: "sky-death",
    speakerId: "qiao",
    text: "我说过了，我相信你。",
    sourceRef: { chapter: 17, lineStart: 2295, lineEnd: 2295 },
  },
  {
    id: "c02-renshe-001",
    scene: "yes-no",
    speakerId: "renshe",
    text: "久违了，各位，我是人蛇。",
    sourceRef: { chapter: 18, lineStart: 2465, lineEnd: 2465 },
  },
  {
    id: "c02-renshe-002",
    scene: "yes-no",
    speakerId: "renshe",
    text: "接下来你们所有人总共可以问我三个问题，而我的回答只有是和否。要注意，我不会说假话。三个问题问完之后，如果我答应救你们，那我就会拉下拉杆；若我没有答应，便会将这道门锁上，任由你们自生自灭。",
    sourceRef: { chapter: 18, lineStart: 2479, lineEnd: 2479 },
  },
  {
    id: "c02-xiao-001",
    scene: "yes-no",
    speakerId: "xiao",
    text: "喂，你能放我们下来吗？！",
    sourceRef: { chapter: 18, lineStart: 2491, lineEnd: 2491 },
  },
  {
    id: "c02-renshe-003",
    scene: "yes-no",
    speakerId: "renshe",
    text: "否。",
    sourceRef: { chapter: 18, lineStart: 2495, lineEnd: 2495 },
  },
  {
    id: "c02-qiao-005",
    scene: "yes-no",
    speakerId: "qiao",
    text: "喂！靓女？！一共三个问题，你不要乱搞啊！",
    sourceRef: { chapter: 18, lineStart: 2497, lineEnd: 2497 },
  },
  {
    id: "c02-qixia-006",
    scene: "yes-no",
    speakerId: "qixia",
    text: "人蛇，假如我的下一个问题是你会不会拉下拉杆，你的回答会跟这个问题一样吗？",
    sourceRef: { chapter: 19, lineStart: 2557, lineEnd: 2557 },
  },
  {
    id: "c02-renshe-004",
    scene: "yes-no",
    speakerId: "renshe",
    text: "你可真是有意思。",
    sourceRef: { chapter: 19, lineStart: 2567, lineEnd: 2567 },
  },
  {
    id: "c02-renlong-001",
    scene: "zodiac-corridor",
    speakerId: "renlong",
    text: "你们好，我是人龙。全员生还？真是新奇啊。",
    sourceRef: { chapter: 20, lineStart: 2793, lineEnd: 2793 },
  },
  {
    id: "c02-renlong-002",
    scene: "zodiac-corridor",
    speakerId: "renlong",
    text: "十天，你们有十天的时间改变这一切。若十天之内你们得不到三千六百个道，那你们所在的世界就会湮灭。你们目之所及的一切也都会一起陪葬。",
    sourceRef: { chapter: 20, lineStart: 2811, lineEnd: 2811 },
  },
  {
    id: "c02-renlong-003",
    scene: "zodiac-corridor",
    speakerId: "renlong",
    text: "你们度过了四个考验：说谎者、雨后春笋、天降死亡、是与非。这是你们的奖励，也是你们的筹码。",
    sourceRef: { chapter: 20, lineStart: 2831, lineEnd: 2831 },
  },
  {
    id: "c02-qixia-007",
    scene: "zodiac-corridor",
    speakerId: "qixia",
    text: "不管怎样，我一定要出去。有人在等我。",
    sourceRef: { chapter: 20, lineStart: 2873, lineEnd: 2873 },
  },
  {
    id: "c02-qiao-006",
    scene: "termination-reveal",
    speakerId: "qiao",
    text: "招灾？什么鬼东西？",
    sourceRef: { chapter: 21, lineStart: 2923, lineEnd: 2923 },
  },
] as const satisfies ReadonlyArray<{
  id: string;
  scene: ChapterTwoSceneId;
  speakerId: ChapterTwoVoiceSpeakerId;
  text: string;
  sourceRef: { chapter: number; lineStart: number; lineEnd: number };
}>;

export type ChapterTwoVoiceLineId = typeof CHAPTER_TWO_VOICE_LINES[number]["id"];

export function voiceLinesForScene(scene: ChapterTwoSceneId) {
  return CHAPTER_TWO_VOICE_LINES.filter((line) => line.scene === scene);
}
