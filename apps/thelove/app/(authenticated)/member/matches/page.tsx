import { MatchCard } from "@/components/matches/match-card";
import { requireUser } from "@/lib/auth/guard";
import { getMatchesForMember } from "@/lib/db/matches";

export default async function MemberMatchesPage() {
  const { user } = await requireUser();
  const matches = await getMatchesForMember(user.id);

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">소개 진행 보기</h1>
        <p className="mt-2 text-sm text-slate-600">
          중매자가 열어준 소개를 단계별로 확인하고 반응을 남길 수 있습니다.
        </p>
      </header>

      <section className="space-y-3">
        {matches.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            아직 배정된 소개가 없습니다.
          </div>
        ) : (
          matches.map((item) => <MatchCard key={item.match.id} item={item} />)
        )}
      </section>
    </main>
  );
}
