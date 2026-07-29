"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ANIMATION_SPECS } from "../../lib/chapter-two/animation.ts";
import { assetFor } from "../../lib/chapter-two/assets.ts";
import type { ChapterTwoAnimationId } from "../../lib/chapter-two/types.ts";
import styles from "./chapter-two.module.css";

const MASK_LINES = [
  "我是「人狗」。",
  "你们受了诅咒。",
  "我希望你们活下去。",
  "时钟一刻不停，四面皆有杀机。",
  "若想活下去，请往家乡的方向转动一百次。",
  "都说雨后春笋，为什么春笋不怕雨打？",
  "雨后见。",
] as const;

function FullAsset({ assetId, contain = false }: { assetId: Parameters<typeof assetFor>[0]; contain?: boolean }) {
  const asset = assetFor(assetId);
  return <Image alt="" className={contain ? styles.cinematicContain : styles.cinematicCover} fill sizes="100vw" src={asset.src} unoptimized />;
}

function AnimationVisual({ animationId }: { animationId: ChapterTwoAnimationId }) {
  switch (animationId) {
    case "mask-writing-reveal":
      return <div className={styles.maskReveal}><FullAsset assetId="renyang-mask-inner" contain /><div>{MASK_LINES.map((line) => <span key={line}>{line}</span>)}</div></div>;
    case "wall-holes-open":
      return <div className={styles.wallMorph}><FullAsset assetId="harpoon-wall-rig" /><i /><i /><i /><i /><i /></div>;
    case "table-turn-right":
      return <div className={styles.tableTurn}><FullAsset assetId="hometown-map-board" contain /><span>×100</span></div>;
    case "table-split":
      return <div className={styles.tableSplit}><FullAsset assetId="table-wedges" contain /><i /><i /><i /><i /><i /><i /><i /><i /></div>;
    case "shield-lock":
      return <div className={styles.shieldLock}><FullAsset assetId="bamboo-cone" contain /><i /></div>;
    case "harpoon-volley":
      return <div className={styles.harpoonVolley}><FullAsset assetId="bamboo-cone" contain /><Image alt="" fill sizes="100vw" src={assetFor("harpoon-rain-fx").src} unoptimized /><span className={styles.injuryTiantian}>甜甜 · 右手</span><span className={styles.injuryHan}>韩一墨 · 肩部</span></div>;
    case "rope-retract":
      return <div className={styles.ropeMotion}><b /><b /><b /><b /><span>墙洞回收</span></div>;
    case "rope-cut-release":
      return <div className={`${styles.ropeMotion} ${styles.ropeCut}`}><b /><b /><b /><b /><i /></div>;
    case "ceiling-holes-open":
      return <div className={styles.ceilingHoles}><FullAsset assetId="ceiling-nine-holes" contain /></div>;
    case "floor-rise":
      return <div className={styles.floorRise}><FullAsset assetId="square-handle-board" contain /><i /><i /><i /></div>;
    case "floor-collapse":
      return <div className={styles.floorCollapse}><FullAsset assetId="collapse-shaft" /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>;
    case "snake-lever":
      return <div className={styles.snakeLever}><FullAsset assetId="renshe" contain /><i /></div>;
    case "corridor-doors":
      return <div className={styles.corridorDoors}><FullAsset assetId="zodiac-corridor" /><i /><i /><i /><i /><i /></div>;
    case "city-reveal":
      return <div className={styles.cityReveal}><div className={styles.cityBack}><FullAsset assetId="termination-city" /></div><div className={styles.cityMid}><FullAsset assetId="termination-plaza" /></div><div className={styles.cityScreen}>我听到了「招灾」的回响。</div><i /></div>;
  }
}

export default function CinematicOverlay({ animationId, replaying, onSkip }: {
  animationId: ChapterTwoAnimationId;
  replaying: boolean;
  onSkip: () => void;
}) {
  const spec = ANIMATION_SPECS[animationId];
  const [canSkip, setCanSkip] = useState(replaying);
  const animationClass = styles[`anim_${animationId.replaceAll("-", "_")}`];

  useEffect(() => {
    if (replaying) return;
    const timer = window.setTimeout(() => setCanSkip(true), spec.skippableAfterMs);
    return () => window.clearTimeout(timer);
  }, [replaying, spec.skippableAfterMs]);

  return (
    <section className={`${styles.cinematic} ${animationClass}`} aria-label={spec.caption} role="dialog">
      <AnimationVisual animationId={animationId} />
      <footer>
        <div><span>{replaying ? "重看动画" : "剧情演出"}</span><p>{spec.caption}</p></div>
        <button disabled={!canSkip} onClick={onSkip}>{replaying ? "结束重看" : canSkip ? "跳过动画" : "演出中…"}</button>
      </footer>
    </section>
  );
}
