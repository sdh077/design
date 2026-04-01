import Link from "next/link";
import { requireMemberBundle } from "@/lib/auth/guard";

export default async function MemberDashboardPage() {
  const { bundle, profile } = await requireMemberBundle();

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">회원 대시보드</h1>
        <p className="mt-2 text-sm text-slate-600">
          {profile.name ?? "회원"}님의 소개 작성과 연결 현황을 확인합니다.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="text-sm text-slate-500">프로필 상태</div>
          <div className="mt-2 text-2xl font-semibold">
            {bundle.memberProfile?.profile_status ?? "draft"}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="text-sm text-slate-500">등록 사진</div>
          <div className="mt-2 text-2xl font-semibold">{bundle.photos.length}</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="text-sm text-slate-500">연결된 중매자</div>
          <div className="mt-2 text-2xl font-semibold">
            {bundle.matchmakerLinks.length}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">다음으로 할 일</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/onboarding"
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
          >
            온보딩 이어서 작성
          </Link>
          <Link
            href="/member/profile"
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium"
          >
            내 프로필 보기
          </Link>
          <Link
            href="/member/profile/photos"
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium"
          >
            사진 올리기
          </Link>
          <Link
            href="/member/matches"
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium"
          >
            소개 진행 보기
          </Link>
        </div>
      </section>
    </main>
  );
}
