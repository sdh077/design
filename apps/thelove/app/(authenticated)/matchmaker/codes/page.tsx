import { createInviteCodeAction } from "@/actions/matchmaker";
import { requireRole } from "@/lib/auth/guard";
import { getMatchmakerCodesForUser } from "@/lib/db/matchmaker";

function getInviteUrl(code: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3004";
  return `${baseUrl}/invite/${encodeURIComponent(code)}`;
}

export default async function MatchmakerCodesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { profile } = await requireRole(["matchmaker", "admin"]);
  const codes = await getMatchmakerCodesForUser(profile.id);
  const params = (await searchParams) ?? {};
  const error =
    typeof params.error === "string" ? decodeURIComponent(params.error) : null;
  const created = params.created === "1";

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">중매자 코드 관리</h1>
        <p className="mt-2 text-sm text-slate-600">
          회원이 입력하거나 초대 링크로 가입할 수 있는 코드를 관리합니다.
        </p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {created ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          새 중매자 코드를 생성했습니다.
        </div>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">새 코드 만들기</h2>
        <form action={createInviteCodeAction} className="mt-4 flex flex-wrap gap-3">
          <input
            name="expiresInDays"
            type="number"
            min="1"
            placeholder="만료일(일수, 선택)"
            className="w-56 rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
          <button className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white">
            초대 코드 생성
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">생성된 코드</h2>

        {codes.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">
            아직 생성된 코드가 없습니다.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {codes.map((code) => (
              <div
                key={code.id}
                className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700"
              >
                <div className="font-medium text-slate-900">{code.code}</div>
                <div className="mt-2">상태: {code.is_active ? "활성" : "비활성"}</div>
                <div>
                  만료일:{" "}
                  {code.expires_at
                    ? new Date(code.expires_at).toLocaleString("ko-KR")
                    : "없음"}
                </div>
                <div className="break-all text-slate-500">
                  초대 링크: {getInviteUrl(code.code)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
