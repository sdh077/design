import Link from "next/link";
import { requireRole } from "@/lib/auth/guard";
import { getMatchReactionStatus, getMatchesForMatchmaker } from "@/lib/db/matches";
import { MatchStageBadge } from "@/components/matches/match-stage-badge";

function getReactionBadge(status: ReturnType<typeof getMatchReactionStatus>) {
  switch (status) {
    case "both_like":
      return {
        label: "양쪽 like",
        className: "bg-emerald-100 text-emerald-700",
      };
    case "one_like":
      return {
        label: "한쪽 like",
        className: "bg-amber-100 text-amber-700",
      };
    case "has_pass":
      return {
        label: "pass 포함",
        className: "bg-rose-100 text-rose-700",
      };
    case "waiting":
    default:
      return {
        label: "응답 대기",
        className: "bg-slate-100 text-slate-700",
      };
  }
}

export default async function MatchmakerMatchesPage() {
  const { profile } = await requireRole(["matchmaker", "admin"]);
  const matches = await getMatchesForMatchmaker(profile.id);

  return (
    <main className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">매칭 관리</h1>
          <p className="mt-2 text-sm text-slate-600">
            생성된 매칭과 단계 공개 현황을 확인합니다.
          </p>
        </div>
        <Link
          href="/matchmaker/matches/new"
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
        >
          새 매칭 만들기
        </Link>
      </header>

      <section className="space-y-3">
        {matches.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            아직 생성된 매칭이 없습니다.
          </div>
        ) : (
          matches.map((match) => (
            (() => {
              const reactionStatus = getMatchReactionStatus(match);
              const reactionBadge = getReactionBadge(reactionStatus);

              return (
                <Link
                  key={match.id}
                  href={`/matchmaker/matches/${match.id}`}
                  className="block rounded-3xl border border-slate-200 bg-white p-6"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <MatchStageBadge stage={match.current_stage} />
                    <span className="text-sm text-slate-500">{match.status}</span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${reactionBadge.className}`}
                    >
                      {reactionBadge.label}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-400">
                        Male
                      </div>
                      <div className="font-medium text-slate-900">
                        {match.male.profile?.name ?? "이름 미입력"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-400">
                        Female
                      </div>
                      <div className="font-medium text-slate-900">
                        {match.female.profile?.name ?? "이름 미입력"}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-slate-600">
                    공개 상태: 남성 {match.open_for_male ? "ON" : "OFF"} / 여성{" "}
                    {match.open_for_female ? "ON" : "OFF"}
                  </div>
                </Link>
              );
            })()
          ))
        )}
      </section>
    </main>
  );
}
