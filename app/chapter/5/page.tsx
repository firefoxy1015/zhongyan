import type { Metadata } from "next";
import StoryChapterGame from "../StoryChapterGame";

export const metadata: Metadata = {
  title: "终焉之地 | 第五章：地牛",
  description: "《十日终焉》单机桌游第五章：十分钟、黑熊与圆形铁板。",
};

export default function ChapterFivePage() {
  return <StoryChapterGame chapterId={5} />;
}
