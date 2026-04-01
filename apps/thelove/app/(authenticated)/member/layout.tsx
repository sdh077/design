import type { ReactNode } from "react";

export default function MemberLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Member</h1>
      </header>
      {children}
    </div>
  );
}
