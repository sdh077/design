import { notFound } from "next/navigation";
import { MatchStageBadge } from "@/components/matches/match-stage-badge";
import { MatchStageControl } from "@/components/matchmaker/match-stage-control";
import { MatchVisibilityControl } from "@/components/matchmaker/match-visibility-control";
import { MatchCloseForm } from "@/components/matchmaker/match-close-form";
import { ReactionSummaryCard } from "@/components/matchmaker/reaction-summary-card";
import { requireRole } from "@/lib/auth/guard";
import { getMatchByIdForMatchmaker } from "@/lib/db/matches";

export default async function MatchmakerMatchDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ matchId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { matchId } = await params;
  const { profile } = await requireRole(["matchmaker", "admin"]);
  const match = await getMatchByIdForMatchmaker(matchId, profile.id);
  const query = (await searchParams) ?? {};
  const error =
    typeof query.error === "string" ? decodeURIComponent(query.error) : null;
  const created = query.created === "1";
  const stageUpdated = query.stageUpdated === "1";
  const visibilityUpdated = query.visibilityUpdated === "1";
  const closed = query.closed === "1";

  if (!match) {
    notFound();
  }

  return (
    <main className="space-y-6">
      <header>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">매칭 상세</h1>
          <MatchStageBadge stage={match.current_stage} />
        </div>
        <p className="mt-2 text-sm text-slate-600">
          {match.male.profile?.name ?? "남성 회원"} /{" "}
          {match.female.profile?.name ?? "여성 회원"} 소개 진행 상황입니다.
        </p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {created ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          매칭을 생성했습니다.
        </div>
      ) : null}
      {stageUpdated ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          공개 단계를 변경했습니다.
        </div>
      ) : null}
      {visibilityUpdated ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          공개 대상을 변경했습니다.
        </div>
      ) : null}
      {closed ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          매칭을 종료했습니다.
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="text-xs uppercase tracking-wide text-slate-400">Male</div>
          <div className="mt-2 text-xl font-semibold">
            {match.male.profile?.name ?? "이름 미입력"}
          </div>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <div>지역: {match.male.profile?.region_text ?? "-"}</div>
            <div>교회: {match.male.profile?.church_name ?? "-"}</div>
            <div>공개 여부: {match.open_for_male ? "공개" : "비공개"}</div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="text-xs uppercase tracking-wide text-slate-400">
            Female
          </div>
          <div className="mt-2 text-xl font-semibold">
            {match.female.profile?.name ?? "이름 미입력"}
          </div>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <div>지역: {match.female.profile?.region_text ?? "-"}</div>
            <div>교회: {match.female.profile?.church_name ?? "-"}</div>
            <div>공개 여부: {match.open_for_female ? "공개" : "비공개"}</div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">공개 단계 관리</h2>
          <div className="mt-4">
            <MatchStageControl
              matchId={match.id}
              currentStage={match.current_stage}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">남/여 공개 제어</h2>
          <div className="mt-4">
            <MatchVisibilityControl
              matchId={match.id}
              openForMale={match.open_for_male}
              openForFemale={match.open_for_female}
            />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">매칭 상태 관리</h2>
        <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
          <div>현재 상태: {match.status}</div>
          <div>종료 사유: {match.closed_reason ?? "-"}</div>
        </div>
        <div className="mt-4">
          <MatchCloseForm matchId={match.id} disabled={match.status === "closed"} />
        </div>
      </section>

      <ReactionSummaryCard match={match} />

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">단계 변경 이력</h2>
        {match.stageLogs.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">이력이 없습니다.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {match.stageLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700"
              >
                <div>
                  단계: {log.from_stage ?? "-"} → {log.to_stage ?? "-"}
                </div>
                <div>메모: {log.note ?? "-"}</div>
                <div>
                  변경 시각: {new Date(log.created_at).toLocaleString("ko-KR")}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
