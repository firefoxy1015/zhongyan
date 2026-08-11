import { CHARACTER_VOICE_PROFILES } from "../testimony-speech.ts";
import { STORY_CHAPTERS } from "./canon.ts";
import type { StorySpeakerId } from "./types.ts";

export const VOLCENGINE_SPEAKER_CATALOG_URL =
  "https://api.volcengine.com/api-docs/view?action=ListSpeakers&serviceCode=speech_saas_prod&version=2025-05-20";

export type StorySynthesisParams = Readonly<Record<string, string | number | boolean>>;

export interface StoryVoiceProfile {
  label: string;
  model: string;
  voiceId: string;
  voiceVersion: string;
  deliveryDirection: string;
  provider: "volcengine-doubao" | "minimax-clone";
  providerVoiceLabel: string;
  catalogUrl: string;
  synthesisParams: StorySynthesisParams;
}

function doubaoProfile(
  base: {
    label: string;
    voiceId: string;
    deliveryDirection: string;
  },
  config: {
    voiceId?: string;
    voiceVersion: string;
    providerVoiceLabel: string;
    speedRatio: number;
    voiceInstruction?: string;
  },
): StoryVoiceProfile {
  const deliveryDirection = config.voiceInstruction ?? base.deliveryDirection;
  return {
    label: base.label,
    model: "doubao-tts-2.0",
    voiceId: config.voiceId ?? base.voiceId,
    voiceVersion: config.voiceVersion,
    deliveryDirection,
    provider: "volcengine-doubao",
    providerVoiceLabel: config.providerVoiceLabel,
    catalogUrl: VOLCENGINE_SPEAKER_CATALOG_URL,
    synthesisParams: {
      speed_ratio: config.speedRatio,
      voice_instruction: deliveryDirection,
    },
  };
}

export const STORY_VOICE_PROFILES: Readonly<Record<StorySpeakerId, StoryVoiceProfile>> = {
  qixia: doubaoProfile(CHARACTER_VOICE_PROFILES.qixia, {
    voiceVersion: "qixia-locked-v3",
    providerVoiceLabel: "云舟 2.0",
    speedRatio: 0.92,
    voiceInstruction: "成年男性，冷静低沉，像在审视证据；判断明确，情绪只在关键处短促加重，绝不使用女声。",
  }),
  qiao: {
    label: CHARACTER_VOICE_PROFILES.qiao.label,
    model: CHARACTER_VOICE_PROFILES.qiao.model,
    voiceId: CHARACTER_VOICE_PROFILES.qiao.voiceId,
    voiceVersion: "qiao-locked-hk-clone-v1",
    deliveryDirection: CHARACTER_VOICE_PROFILES.qiao.deliveryDirection,
    provider: "minimax-clone",
    providerVoiceLabel: "海螺克隆，香港粤语男声基底",
    catalogUrl: "https://platform.minimaxi.com/document/Announcement?key=66719005a427f0c8a5701643",
    synthesisParams: CHARACTER_VOICE_PROFILES.qiao.synthesisParams,
  },
  tiantian: doubaoProfile(CHARACTER_VOICE_PROFILES.tiantian, {
    voiceVersion: "tiantian-locked-v3",
    providerVoiceLabel: "甜美桃子 2.0",
    speedRatio: 1.02,
    voiceInstruction: "成年女性，甜美妩媚但不幼态；语气自然，遇到危险时收住笑意并显出真实紧张。",
  }),
  lin: doubaoProfile(CHARACTER_VOICE_PROFILES.lin, {
    voiceVersion: "lin-locked-v3",
    providerVoiceLabel: "温婉珊珊 2.0",
    speedRatio: 0.94,
    voiceInstruction: "成年女性，温和平静、观察敏锐，始终保留一点疏离感；不装可爱，不使用播音腔。",
  }),
  li: doubaoProfile(CHARACTER_VOICE_PROFILES.li, {
    voiceVersion: "li-locked-v3",
    providerVoiceLabel: "刘飞 2.0",
    speedRatio: 0.91,
    voiceInstruction: "成年男刑警，低沉强势、带审讯感；负伤后气息虚弱但仍保持职业克制。",
  }),
  zhao: doubaoProfile(CHARACTER_VOICE_PROFILES.zhao, {
    voiceVersion: "zhao-locked-v3",
    providerVoiceLabel: "大壹 2.0",
    speedRatio: 0.94,
    voiceInstruction: "成年男医生，清醒稳重、理性克制；解释判断时清楚简洁，不夸张表演。",
  }),
  han: doubaoProfile(CHARACTER_VOICE_PROFILES.han, {
    voiceVersion: "han-locked-v3",
    providerVoiceLabel: "儒雅逸辰 2.0",
    speedRatio: 0.9,
    voiceInstruction: "成年男作家，文气、迟疑、克制；面对死亡时声音发紧，但不歇斯底里。",
  }),
  zhang: doubaoProfile(CHARACTER_VOICE_PROFILES.zhang, {
    voiceVersion: "zhang-locked-v3",
    providerVoiceLabel: "知性灿灿 2.0",
    speedRatio: 0.96,
    voiceInstruction: "成年女律师，清冷理性、咬字利落；受创时仍努力组织事实，不使用柔弱撒娇腔。",
  }),
  xiao: doubaoProfile(CHARACTER_VOICE_PROFILES.xiao, {
    voiceVersion: "xiao-locked-v3",
    providerVoiceLabel: "邻家女孩 2.0",
    speedRatio: 0.97,
    voiceInstruction: "年轻女幼师，怯生、紧张、柔软；声音自然清楚，不使用卡通幼女腔。",
  }),
  "store-clerk": doubaoProfile(
    {
      label: "便利店员",
      voiceId: "zh_female_liuchangnv_uranus_bigtts",
      deliveryDirection: "成年女性，长期饥饿后的沙哑气声，思维迟钝；突然兴奋时加快，但不使用卡通腔。",
    },
    { voiceVersion: "store-clerk-locked-v2", providerVoiceLabel: "流畅女声 2.0", speedRatio: 0.86 },
  ),
  "human-rat": doubaoProfile(
    {
      label: "人鼠",
      voiceId: "zh_female_tianmeixiaoyuan_uranus_bigtts",
      deliveryDirection: "十几岁少女，声音清亮、礼貌、紧张；赌命时呼吸发颤，但不使用甜甜的成熟妩媚音色。",
    },
    { voiceVersion: "human-rat-locked-v2", providerVoiceLabel: "甜美小源 2.0", speedRatio: 1.04 },
  ),
  zhuque: doubaoProfile(
    {
      label: "朱雀",
      voiceId: "zh_male_sophie_uranus_bigtts",
      deliveryDirection: "成年男性，柔和漂亮却危险，像在安抚猎物；语速舒缓，不咆哮。",
    },
    { voiceVersion: "zhuque-locked-v2", providerVoiceLabel: "魅力苏菲 2.0", speedRatio: 0.84 },
  ),
  "ground-ox": doubaoProfile(
    {
      label: "地牛",
      voiceId: "zh_male_qingshuangnanda_uranus_bigtts",
      deliveryDirection: "成年男性，低沉平稳，像无情绪的规则播报器；停顿清楚，不做戏剧化起伏。",
    },
    { voiceVersion: "ground-ox-locked-v2", providerVoiceLabel: "清爽男大 2.0", speedRatio: 0.82 },
  ),
  "zhang-shan": doubaoProfile(
    {
      label: "张山",
      voiceId: "zh_male_sunwukong_uranus_bigtts",
      deliveryDirection: "成年北方男性，粗犷豪爽、气息强、直来直去；战后疲惫但不虚弱，不使用滑稽猴腔。",
    },
    { voiceVersion: "zhang-shan-locked-v2", providerVoiceLabel: "猴哥 2.0", speedRatio: 1.01 },
  ),
  "little-glasses": doubaoProfile(
    {
      label: "小眼镜",
      voiceId: "zh_male_shaonianzixin_uranus_bigtts",
      deliveryDirection: "年轻男性，语速略快，善良紧张；害怕时仍会主动站出来，不使用齐夏的冷沉声线。",
    },
    { voiceVersion: "little-glasses-locked-v2", providerVoiceLabel: "少年梓辛 2.0", speedRatio: 1.08 },
  ),
  xiaoxiao: doubaoProfile(
    {
      label: "潇潇",
      voiceId: "zh_female_qingxinnvsheng_uranus_bigtts",
      deliveryDirection: "年轻女性，起初平静朴素，随后显出冷漠偏执；威胁时克制而非尖叫，体格强壮但不刻意压低成男声。",
    },
    { voiceVersion: "xiaoxiao-locked-v1", providerVoiceLabel: "清新女声 2.0", speedRatio: 0.88 },
  ),
  "old-lu": doubaoProfile(
    {
      label: "老吕",
      voiceId: "zh_male_yuanboxiaoshu_uranus_bigtts",
      deliveryDirection: "矮胖中年男性，市井、爱抱怨、说话直；占便宜时带假笑，认真时收住油滑感。",
    },
    { voiceVersion: "old-lu-locked-v1", providerVoiceLabel: "渊博小叔 2.0", speedRatio: 1.06 },
  ),
  "human-pig": doubaoProfile(
    {
      label: "人猪",
      voiceId: "zh_male_shenyeboke_uranus_bigtts",
      deliveryDirection: "中年男性，隔着猪头面具仍沉稳清楚；主持赌局时压迫克制，最后赎罪时疲惫平静。",
    },
    { voiceVersion: "human-pig-locked-v1", providerVoiceLabel: "深夜播客 2.0", speedRatio: 0.86 },
  ),
  "human-rabbit": doubaoProfile(
    {
      label: "人兔",
      voiceId: "zh_female_meilinvyou_uranus_bigtts",
      deliveryDirection: "成年女性，妩媚轻佻、带危险的玩笑感；故意拖长关键词，但不能说成少女或儿童。",
    },
    { voiceVersion: "human-rabbit-locked-v1", providerVoiceLabel: "魅力女友 2.0", speedRatio: 0.91 },
  ),
};

export const STORY_VOICE_LINES = Object.values(STORY_CHAPTERS).flatMap((chapter) =>
  chapter.scenes.flatMap((scene) => scene.dialogue.map((line) => ({ ...line, chapterId: chapter.id, sceneId: scene.id }))),
);

export type StoryVoiceLine = (typeof STORY_VOICE_LINES)[number];

export function storyVoiceLockPayload(line: StoryVoiceLine, profile = STORY_VOICE_PROFILES[line.speakerId]) {
  return {
    lineId: line.id,
    chapterId: line.chapterId,
    sceneId: line.sceneId,
    speakerId: line.speakerId,
    text: line.text,
    profile: {
      label: profile.label,
      model: profile.model,
      voiceId: profile.voiceId,
      voiceVersion: profile.voiceVersion,
      deliveryDirection: profile.deliveryDirection,
      provider: profile.provider,
      providerVoiceLabel: profile.providerVoiceLabel,
      catalogUrl: profile.catalogUrl,
      synthesisParams: profile.synthesisParams,
    },
  } as const;
}

export function storyVoiceLine(lineId: string) {
  return STORY_VOICE_LINES.find((line) => line.id === lineId);
}
