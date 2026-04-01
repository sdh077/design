import { notFound } from "next/navigation";
import { MatchStageBadge } from "@/components/matches/match-stage-badge";
import { ReactionButtons } from "@/components/matches/reaction-buttons";
import { VisibleProfileCard } from "@/components/matches/visible-profile-card";
import { requireUser } from "@/lib/auth/guard";
import { getMatchByIdForMember } from "@/lib/db/matches";

export default async function MemberMatchDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ matchId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { matchId } = await params;
  const { user } = await requireUser();
  const item = await getMatchByIdForMember(matchId, user.id);
  const query = (await searchParams) ?? {};
  const error =
    typeof query.error === "string" ? decodeURIComponent(query.error) : null;
  const reactionSaved = query.reactionSaved === "1";

  if (!item) {
    notFound();
  }

  return (
    <main className="space-y-6">
      <header>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">소개 상세</h1>
          <MatchStageBadge stage={item.match.current_stage} />
        </div>
        <p className="mt-2 text-sm text-slate-600">
          단계별 공개 정보 확인 후 마음에 드는지 반응을 남길 수 있습니다.
        </p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {reactionSaved ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          반응을 저장했습니다. 중매자가 확인 후 다음 단계를 조정할 수 있습니다.
        </div>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-lg font-semibold">
            {item.counterpart.profile?.name ?? "소개 상대"}
          </div>
          <span className="text-sm text-slate-500">
            {item.isOpenToViewer ? "내게 공개됨" : "아직 비공개"}
          </span>
        </div>
        <div className="mt-4">
          <ReactionButtons
            matchId={item.match.id}
            currentReaction={item.currentReaction}
            disabled={!item.isOpenToViewer}
          />
        </div>
      </section>

      <VisibleProfileCard item={item} />
    </main>
  );
}
