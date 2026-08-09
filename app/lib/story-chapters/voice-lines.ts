import { CHARACTER_VOICE_PROFILES } from "../testimony-speech.ts";
import { STORY_CHAPTERS } from "./canon.ts";
import type { StorySpeakerId } from "./types.ts";

export const STORY_VOICE_PROFILES: Readonly<Record<StorySpeakerId, {
  label: string;
  model: string;
  voiceId: string;
  voiceVersion: string;
  deliveryDirection: string;
}>> = {
  qixia: { ...CHARACTER_VOICE_PROFILES.qixia, voiceVersion: "qixia-locked-v2" },
  qiao: { ...CHARACTER_VOICE_PROFILES.qiao, voiceVersion: "qiao-hk-clone-v1" },
  tiantian: { ...CHARACTER_VOICE_PROFILES.tiantian, voiceVersion: "tiantian-locked-v2" },
  lin: { ...CHARACTER_VOICE_PROFILES.lin, voiceVersion: "lin-locked-v2" },
  li: { ...CHARACTER_VOICE_PROFILES.li, voiceVersion: "li-locked-v2" },
  zhao: { ...CHARACTER_VOICE_PROFILES.zhao, voiceVersion: "zhao-locked-v2" },
  han: { ...CHARACTER_VOICE_PROFILES.han, voiceVersion: "han-locked-v2" },
  zhang: { ...CHARACTER_VOICE_PROFILES.zhang, voiceVersion: "zhang-locked-v2" },
  xiao: { ...CHARACTER_VOICE_PROFILES.xiao, voiceVersion: "xiao-locked-v2" },
  "store-clerk": { label: "便利店员", model: "doubao-tts-2.0", voiceId: "zh_female_cancan_uranus_bigtts", voiceVersion: "store-clerk-locked-v1", deliveryDirection: "成年女性，长期饥饿后的沙哑气声，思维迟钝，突然兴奋时仍不使用卡通腔。" },
  "human-rat": { label: "人鼠", model: "doubao-tts-2.0", voiceId: "zh_female_tianmeitaozi_uranus_bigtts", voiceVersion: "human-rat-locked-v1", deliveryDirection: "十几岁少女，声音清亮、礼貌、紧张，面对赌命时明显发抖。" },
  zhuque: { label: "朱雀", model: "doubao-tts-2.0", voiceId: "zh_male_ruyayichen_uranus_bigtts", voiceVersion: "zhuque-locked-v1", deliveryDirection: "成年男性，柔和、漂亮、危险，语气像安抚猎物，不咆哮。" },
  "ground-ox": { label: "地牛", model: "doubao-tts-2.0", voiceId: "zh_male_dayi_uranus_bigtts", voiceVersion: "ground-ox-locked-v1", deliveryDirection: "成年男性，低沉平稳，规则宣读机械克制，不带情绪。" },
  "zhang-shan": { label: "张山", model: "doubao-tts-2.0", voiceId: "zh_male_liufei_uranus_bigtts", voiceVersion: "zhang-shan-locked-v1", deliveryDirection: "成年北方男性，粗犷豪爽、气息强、战后疲惫但不虚弱。" },
  "little-glasses": { label: "小眼镜", model: "doubao-tts-2.0", voiceId: "zh_male_m191_uranus_bigtts", voiceVersion: "little-glasses-locked-v1", deliveryDirection: "年轻男性，语速快，善良紧张，害怕时仍会主动站出来。" },
};

export const STORY_VOICE_LINES = Object.values(STORY_CHAPTERS).flatMap((chapter) =>
  chapter.scenes.flatMap((scene) => scene.dialogue.map((line) => ({ ...line, chapterId: chapter.id, sceneId: scene.id }))),
);

export type StoryVoiceLine = typeof STORY_VOICE_LINES[number];

export function storyVoiceLine(lineId: string) {
  return STORY_VOICE_LINES.find((line) => line.id === lineId);
}
