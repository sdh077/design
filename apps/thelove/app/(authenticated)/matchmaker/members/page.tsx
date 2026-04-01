import { requireRole } from "@/lib/auth/guard";
import { getConnectedMembersForMatchmaker } from "@/lib/db/matches";
import { MemberListTable } from "@/components/matchmaker/member-list-table";

export default async function MatchmakerMembersPage() {
  const { profile } = await requireRole(["matchmaker", "admin"]);
  const members = await getConnectedMembersForMatchmaker(profile.id);

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">연결된 회원</h1>
        <p className="mt-2 text-sm text-slate-600">
          중매자 코드로 연결된 회원들을 확인하고 매칭 후보를 고릅니다.
        </p>
      </header>

      <MemberListTable members={members} />
    </main>
  );
}
