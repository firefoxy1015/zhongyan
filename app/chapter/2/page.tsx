import type { Metadata } from "next";
import ChapterTwoGame from "./ChapterTwoGame";

export const metadata: Metadata = {
  title: "终焉之地 | 第二章：四面杀机",
  description: "《十日终焉》单机推理 RPG 第二章。",
};

export default function ChapterTwoPage() {
  return <ChapterTwoGame />;
}
