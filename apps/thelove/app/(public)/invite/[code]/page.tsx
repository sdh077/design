import Link from "next/link";
import { getMatchmakerCodePreview } from "@/lib/db/matchmaker";

export default async function InviteCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const preview = await getMatchmakerCodePreview(code);
  const isExpired =
    !!preview?.expiresAt && new Date(preview.expiresAt).getTime() < Date.now();

  if (!preview) {
    return (
      <div className="mx-auto flex max-w-xl flex-1 flex-col justify-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-8">
          <h1 className="text-2xl font-semibold">초대 링크를 찾을 수 없어요</h1>
          <p className="mt-3 text-sm text-slate-600">
            코드가 잘못되었거나 더 이상 사용할 수 없습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-1 flex-col justify-center">
      <div className="rounded-3xl border border-slate-200 bg-white p-8">
        <h1 className="text-3xl font-semibold">중매자 초대 링크</h1>
        <p className="mt-3 text-sm text-slate-600">
          {preview.matchmakerName
            ? `${preview.matchmakerName} 중매자와 연결되는 가입 링크입니다.`
            : "중매자와 연결되는 가입 링크입니다."}
        </p>

        <div className="mt-6 space-y-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          <div>코드: {preview.code}</div>
          <div>상태: {preview.isActive ? "활성" : "비활성"}</div>
          <div>만료 여부: {isExpired ? "만료됨" : "사용 가능"}</div>
        </div>

        <div className="mt-6 flex gap-3">
          <Link
            href={`/signup?inviteCode=${encodeURIComponent(preview.code)}`}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
          >
            이 코드로 회원가입
          </Link>
          <Link
            href={`/login?inviteCode=${encodeURIComponent(preview.code)}`}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium"
          >
            로그인 후 연결
          </Link>
        </div>
      </div>
    </div>
  );
}
