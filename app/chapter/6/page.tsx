import type { Metadata } from "next";
import StoryChapterGame from "../StoryChapterGame";

export const metadata: Metadata = {
  title: "终焉之地 | 第六章：极道",
  description: "《十日终焉》单机桌游第六章：不同年代、钟响陷阱与被焚毁的九十六颗道。",
};

export default function ChapterSixPage() {
  return <StoryChapterGame chapterId={6} />;
}
