import { submitReactionAction } from "@/actions/matches";
import type { MatchReactionRecord } from "@/types/match";

export function ReactionButtons({
  matchId,
  currentReaction,
  disabled,
}: {
  matchId: string;
  currentReaction: MatchReactionRecord | null;
  disabled?: boolean;
}) {
  return (
    <form action={submitReactionAction} className="flex flex-wrap gap-3">
      <input type="hidden" name="matchId" value={matchId} />
      <button
        name="reaction"
        value="like"
        disabled={disabled}
        className={`rounded-xl px-5 py-3 text-sm font-medium ${
          currentReaction?.reaction === "like"
            ? "bg-emerald-600 text-white"
            : "border border-slate-300 bg-white text-slate-900"
        } ${disabled ? "opacity-50" : ""}`}
      >
        마음에 든다
      </button>
      <button
        name="reaction"
        value="pass"
        disabled={disabled}
        className={`rounded-xl px-5 py-3 text-sm font-medium ${
          currentReaction?.reaction === "pass"
            ? "bg-slate-900 text-white"
            : "border border-slate-300 bg-white text-slate-900"
        } ${disabled ? "opacity-50" : ""}`}
      >
        pass
      </button>
    </form>
  );
}
