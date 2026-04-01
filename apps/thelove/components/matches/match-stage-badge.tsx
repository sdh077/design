import { getMatchStageLabel } from "@/lib/domain/match-stage";

export function MatchStageBadge({ stage }: { stage: number }) {
  return (
    <span className="rounded-full border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700">
      {getMatchStageLabel(stage)}
    </span>
  );
}
