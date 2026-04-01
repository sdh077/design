import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@workspace/ui/globals.css";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "TheLove",
  description: "TheLove application scaffold",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={cn("dark font-sans")}>
      <body>{children}</body>
    </html>
  );
}
