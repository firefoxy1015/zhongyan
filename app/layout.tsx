import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "十日终焉：单机剧情 RPG",
  description: "以桌游与叙事 RPG 方式体验《十日终焉》原著关卡。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
