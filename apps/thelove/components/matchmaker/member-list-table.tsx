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
    <>
      <div className="grid gap-3 md:hidden">
        {members.map((member) => (
          <article
            key={member.id}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium text-slate-900">
                  {member.name ?? "이름 미입력"}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {member.introNameAge ?? "-"}
                </div>
              </div>
              <Link
                href={`/matchmaker/members/${member.id}`}
                className="shrink-0 text-sm font-medium text-slate-900 underline"
              >
                상세보기
              </Link>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-slate-500">성별</dt>
                <dd className="mt-1 text-slate-900">{member.gender ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">프로필 상태</dt>
                <dd className="mt-1 text-slate-900">{member.profileStatus ?? "-"}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-slate-500">교회 / 지역</dt>
                <dd className="mt-1 text-slate-900">
                  {[member.churchName, member.regionText].filter(Boolean).join(" / ") ||
                    "-"}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-slate-500">연결일</dt>
                <dd className="mt-1 text-slate-900">
                  {new Date(member.connectedAt).toLocaleDateString("ko-KR")}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 md:block">
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
    </>
  );
}
