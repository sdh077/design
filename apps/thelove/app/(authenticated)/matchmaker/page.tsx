import Link from "next/link";
import { requireRole } from "@/lib/auth/guard";
import { getMatchmakerDashboardSummary } from "@/lib/db/matchmaker";

export default async function MatchmakerDashboardPage() {
  const { profile } = await requireRole(["matchmaker", "admin"]);
  const summary = await getMatchmakerDashboardSummary(profile.id);

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">중매자 대시보드</h1>
        <p className="mt-2 text-sm text-slate-600">
          코드 생성, 회원 연결, 매칭 진행 현황을 한 곳에서 관리합니다.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="text-sm text-slate-500">전체 코드</div>
          <div className="mt-2 text-3xl font-semibold">{summary.totalCodes}</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="text-sm text-slate-500">활성 코드</div>
          <div className="mt-2 text-3xl font-semibold">{summary.activeCodes}</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="text-sm text-slate-500">연결된 회원</div>
          <div className="mt-2 text-3xl font-semibold">
            {summary.connectedMembers}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="text-sm text-slate-500">진행 중 매칭</div>
          <div className="mt-2 text-3xl font-semibold">{summary.activeMatches}</div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">빠른 이동</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/matchmaker/codes"
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
          >
            코드 관리
          </Link>
          <Link
            href="/matchmaker/members"
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium"
          >
            회원 보기
          </Link>
          <Link
            href="/matchmaker/matches"
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium"
          >
            매칭 관리
          </Link>
        </div>
      </section>
    </main>
  );
}
