import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@workspace/ui/globals.css";
import "./globals.css";
import { Cormorant_Garamond, Noto_Sans_KR } from "next/font/google";
import { cn } from "@/lib/utils";

const bodyFont = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "700"],
});

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TheLove",
  description: "TheLove application scaffold",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ko"
      className={cn("dark font-sans", bodyFont.variable, displayFont.variable)}
    >
      <body>{children}</body>
    </html>
  );
}
