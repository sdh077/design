import type { MatchSummary } from "@/types/match";

function getReaction(match: MatchSummary, userId: string) {
  return match.reactions.find((reaction) => reaction.user_id === userId) ?? null;
}

export function ReactionSummaryCard({ match }: { match: MatchSummary }) {
  const maleReaction = getReaction(match, match.male.profile?.id ?? "");
  const femaleReaction = getReaction(match, match.female.profile?.id ?? "");
  const bothLike =
    maleReaction?.reaction === "like" && femaleReaction?.reaction === "like";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold">반응 요약</h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-400">Male</div>
          <div className="mt-2 text-base font-medium text-slate-900">
            {match.male.profile?.name ?? "이름 미입력"}
          </div>
          <div className="mt-2 text-sm text-slate-600">
            반응: {maleReaction?.reaction ?? "대기 중"}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-400">
            Female
          </div>
          <div className="mt-2 text-base font-medium text-slate-900">
            {match.female.profile?.name ?? "이름 미입력"}
          </div>
          <div className="mt-2 text-sm text-slate-600">
            반응: {femaleReaction?.reaction ?? "대기 중"}
          </div>
        </div>
      </div>

      <div
        className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
          bothLike
            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border border-slate-200 bg-slate-50 text-slate-700"
        }`}
      >
        {bothLike
          ? "서로 like 상태입니다. 다음 공개 단계로 올리는 것을 검토해 보세요."
          : "양쪽 반응이 모두 모이면 다음 단계 공개를 판단하기 좋습니다."}
      </div>
    </div>
  );
}
