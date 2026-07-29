import type { ChapterTwoVoiceLineId, ChapterTwoVoiceSpeakerId } from "./voice-lines.ts";

export interface ChapterTwoVoiceAsset {
  src: string;
  sha256: string;
  inputHash: string;
  speakerId: ChapterTwoVoiceSpeakerId;
  voiceVersion: string;
  model: string;
}

export const CHAPTER_TWO_VOICE_ASSETS: Readonly<Partial<Record<ChapterTwoVoiceLineId, ChapterTwoVoiceAsset>>> = Object.freeze({
  "c02-qixia-001": {
    "src": "/audio/chapter-02/voice/c02-qixia-001.61fe9a550075.mp3",
    "sha256": "61fe9a5500750bf0d7263108d7bc867398b30537044d2b785e889aa9acc8a3bf",
    "inputHash": "cc6e2243b1f670cd2ff3f1db71426498cb377af962d5f8c737391591517261c0",
    "speakerId": "qixia",
    "voiceVersion": "qixia-locked-v2",
    "model": "doubao-tts-2.0"
  },
  "c02-qiao-001": {
    "src": "/audio/chapter-02/voice/c02-qiao-001.0df68189be77.mp3",
    "sha256": "0df68189be772d58624a37bc14b3a1d380dc210b18ea392619f13fed29044ccd",
    "inputHash": "bdbe16423f15846601fab8b9a33f954fa4be98f392e5ee82102c9508bafbb8c9",
    "speakerId": "qiao",
    "voiceVersion": "qiao-hk-clone-v1",
    "model": "speech-2.8"
  },
  "c02-qiao-002": {
    "src": "/audio/chapter-02/voice/c02-qiao-002.577ce083921f.mp3",
    "sha256": "577ce083921f1404d32752e8a73e4837f97cecd3075ca343ddfc691dc87701df",
    "inputHash": "a9626ed86d528fb8c8705374794651d3c0f35d31ca411d534e3e7c34a8950fb5",
    "speakerId": "qiao",
    "voiceVersion": "qiao-hk-clone-v1",
    "model": "speech-2.8"
  },
  "c02-qixia-002": {
    "src": "/audio/chapter-02/voice/c02-qixia-002.43caf60ba6f8.mp3",
    "sha256": "43caf60ba6f8500fd60aa8ee59b337276bef930c15de5d6a31d0a6a42899c1fa",
    "inputHash": "9dbfbe33db324758d67cc79b8936f4ed08c308af7e81063218d3804d94ccbd60",
    "speakerId": "qixia",
    "voiceVersion": "qixia-locked-v2",
    "model": "doubao-tts-2.0"
  },
  "c02-qixia-003": {
    "src": "/audio/chapter-02/voice/c02-qixia-003.b309afec5223.mp3",
    "sha256": "b309afec52239d50d17f4ac53560bafbd4a9aab0de772d7ef9cd18251693ff56",
    "inputHash": "925a70ac5c27a76f2bd83351315c0a7ecb3f48953b3ce305fb97851d0ff58ebb",
    "speakerId": "qixia",
    "voiceVersion": "qixia-locked-v2",
    "model": "doubao-tts-2.0"
  },
  "c02-li-001": {
    "src": "/audio/chapter-02/voice/c02-li-001.59e366a40a9b.mp3",
    "sha256": "59e366a40a9b08503af1f1f8820051c82964e7c7f81cbdc53977a071645f8202",
    "inputHash": "5d244c2c25abba069defe92fa21b083989f7a915ed1448146338f007a45fd183",
    "speakerId": "li",
    "voiceVersion": "li-locked-v2",
    "model": "doubao-tts-2.0"
  },
  "c02-qixia-004": {
    "src": "/audio/chapter-02/voice/c02-qixia-004.9a955e0de5b2.mp3",
    "sha256": "9a955e0de5b20ac584228f8fa5ace9cd25b3b7afda7c5919ace8ac038d6a2b3f",
    "inputHash": "65f3aead656edac33141eebb9b0d93e6642b9a97f988213c527ca08330601465",
    "speakerId": "qixia",
    "voiceVersion": "qixia-locked-v2",
    "model": "doubao-tts-2.0"
  },
  "c02-lin-001": {
    "src": "/audio/chapter-02/voice/c02-lin-001.5e35cc76b560.mp3",
    "sha256": "5e35cc76b56047f9601704cdf2ad24be37f0bc9e07daecb82d668b5f23df3a4b",
    "inputHash": "5690b8e0a57f7f4c9544d0c86ffad17954c3987922055faa8f98e7a65c721d1a",
    "speakerId": "lin",
    "voiceVersion": "lin-locked-v2",
    "model": "doubao-tts-2.0"
  },
  "c02-qiao-003": {
    "src": "/audio/chapter-02/voice/c02-qiao-003.9631f4366719.mp3",
    "sha256": "9631f43667198a6fed51e1be022c44727a2c35c6dae8889afda569513cdca57a",
    "inputHash": "e04b3e63207444607f221af10166a2f4b7dc1cb4bcc399b594cda261a64a85fc",
    "speakerId": "qiao",
    "voiceVersion": "qiao-hk-clone-v1",
    "model": "speech-2.8"
  },
  "c02-qixia-005": {
    "src": "/audio/chapter-02/voice/c02-qixia-005.cb049288ab0f.mp3",
    "sha256": "cb049288ab0fdd64f37dc4b5251f8f2aec78740c6c16c4dfa214fa4a39f755e2",
    "inputHash": "baedd8fbfe1e620cf494addcd02684216e97be25a2300df7d3a555e377db7c72",
    "speakerId": "qixia",
    "voiceVersion": "qixia-locked-v2",
    "model": "doubao-tts-2.0"
  },
  "c02-qiao-004": {
    "src": "/audio/chapter-02/voice/c02-qiao-004.a296ab950bf7.mp3",
    "sha256": "a296ab950bf76021ef06e5288e30157efef04d06b1c71f73f8ff1bff3b5b461a",
    "inputHash": "2f2acba2b82029516851cd3b14b747a22e6402707989f76697912204c385c17f",
    "speakerId": "qiao",
    "voiceVersion": "qiao-hk-clone-v1",
    "model": "speech-2.8"
  },
  "c02-renshe-001": {
    "src": "/audio/chapter-02/voice/c02-renshe-001.de9f4dae9a00.mp3",
    "sha256": "de9f4dae9a008d17a2508c11fbd275ccd9877441866593e31870ee4c8256abcd",
    "inputHash": "a33f3dd1a11ed2e02bb104c92cd95f366d3a64cdbb2a90ca9f613058ed1eab9f",
    "speakerId": "renshe",
    "voiceVersion": "renshe-locked-v1",
    "model": "doubao-tts-2.0"
  },
  "c02-renshe-002": {
    "src": "/audio/chapter-02/voice/c02-renshe-002.defc8ab323f5.mp3",
    "sha256": "defc8ab323f55428c47ac200ed098832ec465a41423d9c8e5e624b3b2bbf670f",
    "inputHash": "d2d8b68aad9a8d9c607c377decdfec3566b8572b7116e6eba35632c80a5fe2b8",
    "speakerId": "renshe",
    "voiceVersion": "renshe-locked-v1",
    "model": "doubao-tts-2.0"
  },
  "c02-xiao-001": {
    "src": "/audio/chapter-02/voice/c02-xiao-001.aa559c7c4203.mp3",
    "sha256": "aa559c7c4203d69fb1180112370f3a7f3091627d93d200519838341c9924fe74",
    "inputHash": "c23362d210ddf0729af29191ce4ddc28f55662cda5c93850850eeae47fcf2e1b",
    "speakerId": "xiao",
    "voiceVersion": "xiao-locked-v2",
    "model": "doubao-tts-2.0"
  },
  "c02-renshe-003": {
    "src": "/audio/chapter-02/voice/c02-renshe-003.4a339c5b36e9.mp3",
    "sha256": "4a339c5b36e9ffe856c322ff73bcb0c26b6177ff487ef7bbce758659db66172f",
    "inputHash": "2114f534ea71055cc9988fcaa21114acae88807a6439a547a72b52296fdcd3a2",
    "speakerId": "renshe",
    "voiceVersion": "renshe-locked-v1",
    "model": "doubao-tts-2.0"
  },
  "c02-qiao-005": {
    "src": "/audio/chapter-02/voice/c02-qiao-005.bd193153a765.mp3",
    "sha256": "bd193153a76509d897547352699cf90c5ed285017733fcbdf2835e6b4191074e",
    "inputHash": "1aa86ec6c202237fd12a508471928b9730ec01c492c23ad7e16f62d0d0a20f4c",
    "speakerId": "qiao",
    "voiceVersion": "qiao-hk-clone-v1",
    "model": "speech-2.8"
  },
  "c02-qixia-006": {
    "src": "/audio/chapter-02/voice/c02-qixia-006.61e67d0d79e3.mp3",
    "sha256": "61e67d0d79e3a75b273447877d60d33381cf2991834dce45f4861ada5084bb56",
    "inputHash": "74ea97d229ac82ff58f18fc1fa1e296c1d991ec591da22fbfc7c79570c3d1072",
    "speakerId": "qixia",
    "voiceVersion": "qixia-locked-v2",
    "model": "doubao-tts-2.0"
  },
  "c02-renshe-004": {
    "src": "/audio/chapter-02/voice/c02-renshe-004.616ed4a93004.mp3",
    "sha256": "616ed4a9300411c8845962639b61929f96c6d0cee747783904073e86120e5c9a",
    "inputHash": "36887fbcf73e20588f1ea20d43d28d18be762bf1aab5bd42b4cb91ae2cb73d5f",
    "speakerId": "renshe",
    "voiceVersion": "renshe-locked-v1",
    "model": "doubao-tts-2.0"
  },
  "c02-renlong-001": {
    "src": "/audio/chapter-02/voice/c02-renlong-001.4abed87df86a.mp3",
    "sha256": "4abed87df86a9d91f5003f7120c3c0bedd1093d7fbb6e71c1c1099b18293981a",
    "inputHash": "24dd2790bfe511ac6654ebe3e69f210920bf7c8e7bdfc28a3d8632a7f870f957",
    "speakerId": "renlong",
    "voiceVersion": "renlong-locked-v1",
    "model": "doubao-tts-2.0"
  },
  "c02-renlong-002": {
    "src": "/audio/chapter-02/voice/c02-renlong-002.c360eba2d295.mp3",
    "sha256": "c360eba2d29543ce0d2b24ec4fa435b3c3efd24baebed71143dd2b009509a86c",
    "inputHash": "fc0be5578490721eb2133123d67431c1d28048584433b15d60faf42b47f63042",
    "speakerId": "renlong",
    "voiceVersion": "renlong-locked-v1",
    "model": "doubao-tts-2.0"
  },
  "c02-renlong-003": {
    "src": "/audio/chapter-02/voice/c02-renlong-003.c985d1e6a0bc.mp3",
    "sha256": "c985d1e6a0bcdf72cf6c0a5151a10cacecc7b90a6482c9be4346dae6493c5b12",
    "inputHash": "b419d69f91799272e612f568d2760ee4c76e63bbf9ff20d85a8d05794b6ee74e",
    "speakerId": "renlong",
    "voiceVersion": "renlong-locked-v1",
    "model": "doubao-tts-2.0"
  },
  "c02-qixia-007": {
    "src": "/audio/chapter-02/voice/c02-qixia-007.600a80c70585.mp3",
    "sha256": "600a80c70585be37ddab5eab0651108b0fe0daf1e47256dffc7a0d4ff3d1086e",
    "inputHash": "11c4441cf2735346fdcc4a032986e1bb849708be0d831f0d37430613ad504e6d",
    "speakerId": "qixia",
    "voiceVersion": "qixia-locked-v2",
    "model": "doubao-tts-2.0"
  },
  "c02-qiao-006": {
    "src": "/audio/chapter-02/voice/c02-qiao-006.7b53a08e4bc7.mp3",
    "sha256": "7b53a08e4bc7797b9506097ebfea6663430cba9b99e0d7069ec9955da6cead49",
    "inputHash": "5c0c0bec367f8c0113adcb83e4e465161123fe9957162187c3c0c35451d5e339",
    "speakerId": "qiao",
    "voiceVersion": "qiao-hk-clone-v1",
    "model": "speech-2.8"
  }
});

export function chapterTwoVoiceAsset(lineId: ChapterTwoVoiceLineId) {
  return CHAPTER_TWO_VOICE_ASSETS[lineId];
}
