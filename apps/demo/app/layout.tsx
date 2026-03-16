import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "신대호 | Fullstack Developer",
  description:
    "문제를 이해하고 구조를 정리하며 개선하는 개발자 신대호의 포트폴리오입니다.",
  keywords: [
    "신대호",
    "frontend developer",
    "fullstack developer",
    "react",
    "nextjs",
    "portfolio",
  ],
  authors: [{ name: "신대호" }],
  creator: "신대호",

  openGraph: {
    title: "신대호 | Fullstack Developer",
    description:
      "문제를 이해하고 구조를 정리하며 개선하는 개발자 신대호의 포트폴리오입니다.",
    url: "http://sdh077.vercel.app/",
    siteName: "신대호 포트폴리오",
    images: [
      {
        url: "",
        width: 1200,
        height: 630,
        alt: "Shin Daeho Portfolio",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-neutral-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}