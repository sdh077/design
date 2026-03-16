import { ReactNode } from "react";

type ChipProps = {
  children: ReactNode;
};

export default function Chip({ children }: ChipProps) {
  return (
    <span className="rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1 text-sm text-zinc-300">
      {children}
    </span>
  );
}