import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "十日终焉：原著同人桌游",
  description: "基于原著剧情资料构建的在线桌游开发版本。",
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
