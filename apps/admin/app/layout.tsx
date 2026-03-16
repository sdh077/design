import "@workspace/ui/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Toss Admin",
  description: "가맹점 운영 어드민",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className="bg-background text-foreground">{children}</body>
    </html>
  );
}