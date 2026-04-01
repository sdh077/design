import { closeMatchAction } from "@/actions/matches";

export function MatchCloseForm({
  matchId,
  disabled,
}: {
  matchId: string;
  disabled?: boolean;
}) {
  return (
    <form action={closeMatchAction} className="space-y-4">
      <input type="hidden" name="matchId" value={matchId} />

      <label className="block space-y-2 text-sm">
        <span>종료 사유</span>
        <textarea
          name="closedReason"
          rows={3}
          placeholder="예: 양측 의사 확인 후 종료, 보류, 진행 중단"
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
          disabled={disabled}
        />
      </label>

      <button
        disabled={disabled}
        className={`rounded-xl px-5 py-3 text-sm font-medium ${
          disabled
            ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
            : "border border-rose-300 bg-white text-rose-700"
        }`}
      >
        매칭 종료
      </button>
    </form>
  );
}
