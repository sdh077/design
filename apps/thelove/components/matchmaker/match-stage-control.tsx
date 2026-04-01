import { updateMatchStageAction } from "@/actions/matches";
import { MATCH_STAGE_STEPS } from "@/lib/domain/match-stage";

export function MatchStageControl({
  matchId,
  currentStage,
}: {
  matchId: string;
  currentStage: number;
}) {
  return (
    <form action={updateMatchStageAction} className="space-y-4">
      <input type="hidden" name="matchId" value={matchId} />

      <label className="block space-y-2 text-sm">
        <span>공개 단계</span>
        <select
          name="nextStage"
          defaultValue={String(currentStage)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
        >
          {MATCH_STAGE_STEPS.map((stage) => (
            <option key={stage.value} value={stage.value}>
              {stage.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2 text-sm">
        <span>변경 메모</span>
        <textarea
          name="note"
          rows={3}
          placeholder="예: 서로 소개글 확인 후 사진까지 공개"
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
        />
      </label>

      <button className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white">
        단계 변경
      </button>
    </form>
  );
}
