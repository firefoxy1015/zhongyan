import type { Metadata } from "next";
import StoryChapterGame from "../StoryChapterGame";

export const metadata: Metadata = {
  title: "终焉之地 | 第八章：舍己",
  description: "《十日终焉》单机桌游第八章：空面具、人兔残局与李尚武最后的选择。",
};

export default function ChapterEightPage() {
  return <StoryChapterGame chapterId={8} />;
}
