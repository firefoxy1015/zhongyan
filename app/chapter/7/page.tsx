import type { Metadata } from "next";
import StoryChapterGame from "../StoryChapterGame";

export const metadata: Metadata = {
  title: "终焉之地 | 第七章：百分百",
  description: "《十日终焉》单机桌游第七章：棋子、真假话与人猪的赌命。",
};

export default function ChapterSevenPage() {
  return <StoryChapterGame chapterId={7} />;
}
