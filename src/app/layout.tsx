import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 러닝크루 2기 | 프롬프트 허브",
  description: "매일 성장하는 AI 러닝크루 2기 프롬프트 지식 허브 & 자율 챌린지 플랫폼",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        {/* 토스/당근/리니어 스타일 고품질 한국어 웹폰트 Pretendard */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="min-h-full bg-[#f8fafc] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
