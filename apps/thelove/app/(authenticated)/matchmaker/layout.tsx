import type { ReactNode } from "react";

export default function MatchmakerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Matchmaker</h1>
      </header>
      {children}
    </div>
  );
}
