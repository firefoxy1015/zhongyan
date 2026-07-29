import type { CharacterVoiceId, VoiceLineKind } from "./testimony-speech.ts";

export type VoiceAssetKey = `${CharacterVoiceId}:${VoiceLineKind}`;
export const VOICE_ASSET_MODEL = "mixed-static";

// Immutable project-local files. Do not replace these URLs at runtime.
export const VOICE_ASSET_URLS: Readonly<Partial<Record<VoiceAssetKey, string>>> = Object.freeze({
  "tiantian:testimony": "/audio/chapter-01/voice/tiantian-testimony.f81df3c768fb.mp3",
  "tiantian:followUp": "/audio/chapter-01/voice/tiantian-followUp.6180514401a0.mp3",
  "qiao:testimony": "/audio/chapter-01/voice/qiao-testimony.eaf73802dc51.mp3",
  "qiao:followUp": "/audio/chapter-01/voice/qiao-followUp.c31192243172.mp3",
  "xiao:testimony": "/audio/chapter-01/voice/xiao-testimony.1545d066daf2.mp3",
  "xiao:followUp": "/audio/chapter-01/voice/xiao-followUp.6e7d2d61e063.mp3",
  "zhao:testimony": "/audio/chapter-01/voice/zhao-testimony.ec2d46a6f5b3.mp3",
  "zhao:followUp": "/audio/chapter-01/voice/zhao-followUp.06242884430f.mp3",
  "han:testimony": "/audio/chapter-01/voice/han-testimony.0ca4d14b53d2.mp3",
  "han:followUp": "/audio/chapter-01/voice/han-followUp.decd3ee1cc97.mp3",
  "zhang:testimony": "/audio/chapter-01/voice/zhang-testimony.9bc5c8da0dc8.mp3",
  "zhang:followUp": "/audio/chapter-01/voice/zhang-followUp.68fd888f7265.mp3",
  "li:testimony": "/audio/chapter-01/voice/li-testimony.4191dc71b00f.mp3",
  "li:followUp": "/audio/chapter-01/voice/li-followUp.2c57551b6fda.mp3",
  "lin:testimony": "/audio/chapter-01/voice/lin-testimony.25b4c8a1dff9.mp3",
  "lin:followUp": "/audio/chapter-01/voice/lin-followUp.24f79286b566.mp3",
  "qixia:testimony": "/audio/chapter-01/voice/qixia-testimony.f192d1c151ad.mp3",
  "qixia:followUp": "/audio/chapter-01/voice/qixia-followUp.5db2c13d968d.mp3"
});

export const VOICE_ASSET_HASHES: Readonly<Partial<Record<VoiceAssetKey, string>>> = Object.freeze({
  "tiantian:testimony": "f81df3c768fbf5ee9c64aeba7d6f992c01eef46e02b0493b03353c76fcbbaa6e",
  "tiantian:followUp": "6180514401a071f2657b080e6549856ca6f80ec3b9ddb210d619d3e89408e754",
  "qiao:testimony": "eaf73802dc5199d5d2d169134f0bc05946d34cb3f80580d7ed2fd35f145acdf3",
  "qiao:followUp": "c31192243172c1c18986164bfda73a4feaad575a16d2a3f46ee2172b400a21c2",
  "xiao:testimony": "1545d066daf27c48b22ef131ed44dca331b89ac16a6b8a92418578a7daa5e6c0",
  "xiao:followUp": "6e7d2d61e06325016ec9ee1281e0c24a5308b4ae56b80cabf94c9b5813e609f6",
  "zhao:testimony": "ec2d46a6f5b3e2e769150c4a68ceae873148ec1103d598ddeeadf3b452f41fd0",
  "zhao:followUp": "06242884430f2597fba0c7c3d300adcb5728b2eee230264ada3be64aebb0deb9",
  "han:testimony": "0ca4d14b53d2f66134cdbd42d942d248cfd7f41d8a927d8f0d83eb6120ca7277",
  "han:followUp": "decd3ee1cc97797617e900f0cd6483a6f81b15f0679b5b62af3aa4e8f97272cd",
  "zhang:testimony": "9bc5c8da0dc82d31ac5ddc389a792d803b1ed1900301034bdc1d63ec508754c7",
  "zhang:followUp": "68fd888f7265d6e2360d57cf1e482ca96836be5289888f4c12e6905f1d13137b",
  "li:testimony": "4191dc71b00fc181c41b239e7e8d8ff4d071232fee0695316157ed468a669d2d",
  "li:followUp": "2c57551b6fda2cc03b351d4975efa02fd1a4fa18c707b543cbafd9a547034d61",
  "lin:testimony": "25b4c8a1dff92d693538a2708dcd001c1c9a6887576985f32056ff946a4d03d3",
  "lin:followUp": "24f79286b56622c46ddfcb33d2b499c6054bac70d8df682da01ab2f3e88b24ba",
  "qixia:testimony": "f192d1c151adf2552211d2a4ec0b1f104976ea6ffd5d2a79ffcea18c12625143",
  "qixia:followUp": "5db2c13d968dc1d9ed87a38e72b29071d2223a467f13f0478ee0a314dbd27d6b"
});

export const VOICE_ASSET_MODELS: Readonly<Partial<Record<VoiceAssetKey, string>>> = Object.freeze({
  "tiantian:testimony": "doubao-tts-2.0",
  "tiantian:followUp": "doubao-tts-2.0",
  "qiao:testimony": "speech-2.8",
  "qiao:followUp": "doubao-tts-2.0",
  "xiao:testimony": "doubao-tts-2.0",
  "xiao:followUp": "doubao-tts-2.0",
  "zhao:testimony": "doubao-tts-2.0",
  "zhao:followUp": "doubao-tts-2.0",
  "han:testimony": "doubao-tts-2.0",
  "han:followUp": "doubao-tts-2.0",
  "zhang:testimony": "doubao-tts-2.0",
  "zhang:followUp": "doubao-tts-2.0",
  "li:testimony": "doubao-tts-2.0",
  "li:followUp": "doubao-tts-2.0",
  "lin:testimony": "doubao-tts-2.0",
  "lin:followUp": "doubao-tts-2.0",
  "qixia:testimony": "doubao-tts-2.0",
  "qixia:followUp": "doubao-tts-2.0"
});

// Every follow-up is rendered with Qi Xia's fixed male voice, not the witness voice.
export const VOICE_ASSET_SPEAKERS: Readonly<Partial<Record<VoiceAssetKey, CharacterVoiceId>>> = Object.freeze({
  "tiantian:testimony": "tiantian",
  "tiantian:followUp": "qixia",
  "qiao:testimony": "qiao",
  "qiao:followUp": "qixia",
  "xiao:testimony": "xiao",
  "xiao:followUp": "qixia",
  "zhao:testimony": "zhao",
  "zhao:followUp": "qixia",
  "han:testimony": "han",
  "han:followUp": "qixia",
  "zhang:testimony": "zhang",
  "zhang:followUp": "qixia",
  "li:testimony": "li",
  "li:followUp": "qixia",
  "lin:testimony": "lin",
  "lin:followUp": "qixia",
  "qixia:testimony": "qixia",
  "qixia:followUp": "qixia"
});

export function voiceAssetFor(characterId: CharacterVoiceId, kind: VoiceLineKind) {
  return VOICE_ASSET_URLS[`${characterId}:${kind}`];
}
