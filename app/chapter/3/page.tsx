import type { Metadata } from "next";
import StoryChapterGame from "../StoryChapterGame";

export const metadata: Metadata = {
  title: "终焉之地 | 第三章：七黑剑",
  description: "《十日终焉》单机桌游第三章：便利店、七黑剑与第一次分队。",
};

export default function ChapterThreePage() {
  return <StoryChapterGame chapterId={3} />;
}
