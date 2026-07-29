export const CHAPTER_TWO_BGM_ASSETS = {
  "room-tension": {
    "src": "/audio/chapter-02/bgm/room-tension.fcd93cccd45a.wav",
    "sha256": "fcd93cccd45a5311ecdbc53914a789502190bc9621186fc90b487be5621bdc77",
    "durationMs": 24000
  },
  "harpoon-crisis": {
    "src": "/audio/chapter-02/bgm/harpoon-crisis.2f1bb5bb0bd4.wav",
    "sha256": "2f1bb5bb0bd4f2eb4cb186a520e8aaa5f4e99f781324fd80c188fc348db00eb5",
    "durationMs": 20000
  },
  "termination-reveal": {
    "src": "/audio/chapter-02/bgm/termination-reveal.f750587f6416.wav",
    "sha256": "f750587f64168b91f97d56e1ec6702ba3be17673eb79d6b8fa6ad0d12daccc64",
    "durationMs": 28000
  }
} as const;

export const CHAPTER_TWO_SFX_ASSETS = {
  "mask-flip": {
    "src": "/audio/chapter-02/sfx/mask-flip.d8ae26615a57.wav",
    "sha256": "d8ae26615a5706d40a408ce5e18721fd23e5a83a3413f8f18c481591d03b39c7",
    "durationMs": 700
  },
  "wall-morph": {
    "src": "/audio/chapter-02/sfx/wall-morph.e5b55f8ce042.wav",
    "sha256": "e5b55f8ce0429802dc928f00f37c4ae6ee581599aa4a95b742d08a08f12e01c9",
    "durationMs": 1500
  },
  "chain-wind": {
    "src": "/audio/chapter-02/sfx/chain-wind.6cf6db029285.wav",
    "sha256": "6cf6db0292858c2a036fd647e1002ef0fc1b69d3c525b8cce24aa45a70afbc7e",
    "durationMs": 1100
  },
  "clock-beam": {
    "src": "/audio/chapter-02/sfx/clock-beam.26e18c1af80a.wav",
    "sha256": "26e18c1af80afb6c8e624ef3dd39f59fc1555e48bc34c600482de6c26af30b3a",
    "durationMs": 850
  },
  "wood-split": {
    "src": "/audio/chapter-02/sfx/wood-split.beb011d0b4d8.wav",
    "sha256": "beb011d0b4d81981656aa564a8719251322a0cf5822cfa7c3de31ae4c360f1fe",
    "durationMs": 1050
  },
  "shield-lock": {
    "src": "/audio/chapter-02/sfx/shield-lock.e2bed02ef723.wav",
    "sha256": "e2bed02ef723d17f296fd8ee009552b4dc20fdb83507859311f8631a09fb38d7",
    "durationMs": 800
  },
  "harpoon-volley": {
    "src": "/audio/chapter-02/sfx/harpoon-volley.e756f99f5211.wav",
    "sha256": "e756f99f52114c75c9dd67f9b3bee2495698b8a8bc9fdbef9d02d93f18de5fa7",
    "durationMs": 1200
  },
  "injury-hit": {
    "src": "/audio/chapter-02/sfx/injury-hit.b507f63505c8.wav",
    "sha256": "b507f63505c8d7876ad8d70ab8c2804a7dcd013eafaa66b8ab6d007aecfc62b4",
    "durationMs": 420
  },
  "rope-snap": {
    "src": "/audio/chapter-02/sfx/rope-snap.49caf549d3db.wav",
    "sha256": "49caf549d3dbd532aa694e186ffea889db6b745bfe2d2bab2862e24d5c9b5def",
    "durationMs": 550
  },
  "floor-rise": {
    "src": "/audio/chapter-02/sfx/floor-rise.b3580be0863b.wav",
    "sha256": "b3580be0863b13d5c3d4538e160c079d568f429d8e2aa6af660ea0e6ca6f1a8e",
    "durationMs": 1600
  },
  "floor-collapse": {
    "src": "/audio/chapter-02/sfx/floor-collapse.7be7e735a969.wav",
    "sha256": "7be7e735a969ed75a0514a084c6a74275f74dcd7fa8df578688afa9bec30b719",
    "durationMs": 1800
  },
  "lever": {
    "src": "/audio/chapter-02/sfx/lever.5c2a98e6e6ff.wav",
    "sha256": "5c2a98e6e6ff25d67f976ebbdc47ae5520cba14aa22c30814c99eab0cd41ef7d",
    "durationMs": 800
  },
  "doors": {
    "src": "/audio/chapter-02/sfx/doors.a1dddab4e5bb.wav",
    "sha256": "a1dddab4e5bb09de073851b52fbc995dcc37584087d9ff2a6d1c81226530168a",
    "durationMs": 1500
  },
  "bell": {
    "src": "/audio/chapter-02/sfx/bell.318dc683d76f.wav",
    "sha256": "318dc683d76f6f92d00fd4a576108f85f2a0b5b8fdec3a789306e0a4638b8499",
    "durationMs": 3200
  }
} as const;

export type ChapterTwoBgmId = keyof typeof CHAPTER_TWO_BGM_ASSETS;
export type ChapterTwoSfxId = keyof typeof CHAPTER_TWO_SFX_ASSETS;
