import type { ReactNode } from "react";

export function SectionCard({ children }: { children: ReactNode }) {
  return <section className="rounded-2xl border p-6">{children}</section>;
}
