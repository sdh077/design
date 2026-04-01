import { MatchCreateForm } from "@/components/matchmaker/match-create-form";
import { requireRole } from "@/lib/auth/guard";
import { getConnectedMembersForMatchmaker } from "@/lib/db/matches";

export default async function MatchmakerNewMatchPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { profile } = await requireRole(["matchmaker", "admin"]);
  const members = await getConnectedMembersForMatchmaker(profile.id);
  const maleMembers = members.filter((member) => member.gender === "male");
  const femaleMembers = members.filter((member) => member.gender === "female");
  const params = (await searchParams) ?? {};
  const error =
    typeof params.error === "string" ? decodeURIComponent(params.error) : null;

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">새 매칭 만들기</h1>
        <p className="mt-2 text-sm text-slate-600">
          연결된 회원 중 남성과 여성을 선택해서 새 소개를 시작합니다.
        </p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <MatchCreateForm maleMembers={maleMembers} femaleMembers={femaleMembers} />
      </section>
    </main>
  );
}
