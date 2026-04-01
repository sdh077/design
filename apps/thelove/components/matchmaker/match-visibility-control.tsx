import { updateMatchVisibilityAction } from "@/actions/matches";

export function MatchVisibilityControl({
  matchId,
  openForMale,
  openForFemale,
}: {
  matchId: string;
  openForMale: boolean;
  openForFemale: boolean;
}) {
  return (
    <form action={updateMatchVisibilityAction} className="space-y-4">
      <input type="hidden" name="matchId" value={matchId} />

      <label className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm">
        <input type="checkbox" name="openForMale" defaultChecked={openForMale} />
        <span>남성에게 공개</span>
      </label>

      <label className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm">
        <input
          type="checkbox"
          name="openForFemale"
          defaultChecked={openForFemale}
        />
        <span>여성에게 공개</span>
      </label>

      <button className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium">
        공개 설정 저장
      </button>
    </form>
  );
}
