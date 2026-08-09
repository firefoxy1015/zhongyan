import type { Metadata } from "next";
import StoryChapterGame from "../StoryChapterGame";

export const metadata: Metadata = {
  title: "终焉之地 | 第四章：仓库寻道",
  description: "《十日终焉》单机桌游第四章：人鼠、赌命与朱雀。",
};

export default function ChapterFourPage() {
  return <StoryChapterGame chapterId={4} />;
}
