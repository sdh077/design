import Link from "next/link";
import { MatchStageBadge } from "@/components/matches/match-stage-badge";
import type { MemberVisibleMatch } from "@/types/match";

export function MatchCard({ item }: { item: MemberVisibleMatch }) {
  return (
    <Link
      href={`/member/matches/${item.match.id}`}
      className="block rounded-3xl border border-slate-200 bg-white p-6"
    >
      <div className="flex flex-wrap items-center gap-3">
        <MatchStageBadge stage={item.match.current_stage} />
        <span className="text-sm text-slate-500">
          {item.isOpenToViewer ? "내게 공개됨" : "아직 비공개"}
        </span>
        {item.currentReaction ? (
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
            내 반응: {item.currentReaction.reaction}
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        <div className="text-lg font-semibold text-slate-900">
          {item.counterpart.profile?.name ?? "소개 상대"}
        </div>
        <div className="mt-1 text-sm text-slate-600">
          {item.counterpart.profile?.church_name ?? "교회 정보 미입력"} /{" "}
          {item.counterpart.profile?.region_text ?? "지역 미입력"}
        </div>
      </div>
    </Link>
  );
}
