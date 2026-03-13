import "@workspace/ui/globals.css";

export const metadata = {
  title: "FM F&B SaaS",
  description: "F&B operations SaaS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body>{children}</body>
    </html>
  );
}