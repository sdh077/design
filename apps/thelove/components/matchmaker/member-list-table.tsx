import Link from "next/link";
import type { MatchmakerMemberOption } from "@/lib/db/matches";

export function MemberListTable({
  members,
}: {
  members: MatchmakerMemberOption[];
}) {
  if (members.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-600">
        연결된 회원이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 text-left">이름</th>
            <th className="px-4 py-3 text-left">성별</th>
            <th className="px-4 py-3 text-left">교회 / 지역</th>
            <th className="px-4 py-3 text-left">프로필 상태</th>
            <th className="px-4 py-3 text-left">연결일</th>
            <th className="px-4 py-3 text-left"></th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border-t border-slate-200">
              <td className="px-4 py-3">
                <div className="font-medium text-slate-900">
                  {member.name ?? "이름 미입력"}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {member.introNameAge ?? "-"}
                </div>
              </td>
              <td className="px-4 py-3">{member.gender ?? "-"}</td>
              <td className="px-4 py-3">
                {[member.churchName, member.regionText].filter(Boolean).join(" / ") ||
                  "-"}
              </td>
              <td className="px-4 py-3">{member.profileStatus ?? "-"}</td>
              <td className="px-4 py-3">
                {new Date(member.connectedAt).toLocaleDateString("ko-KR")}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/matchmaker/members/${member.id}`}
                  className="text-slate-900 underline"
                >
                  상세보기
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
