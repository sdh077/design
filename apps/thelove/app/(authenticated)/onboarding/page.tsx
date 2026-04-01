import Link from "next/link";
import { requireUser } from "@/lib/auth/guard";
import { getMemberProfileBundle } from "@/lib/db/profile";
import { MatchmakerCodeForm } from "@/components/onboarding/matchmaker-code-form";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

function toListText(items: string[]) {
  return items.length > 0 ? items.join(", ") : "-";
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user } = await requireUser();
  const bundle = await getMemberProfileBundle(user.id);
  const params = (await searchParams) ?? {};
  const error =
    typeof params.error === "string" ? decodeURIComponent(params.error) : null;
  const saved = params.saved === "1";
  const connected = params.connected === "1";

  return (
    <main className="space-y-6">
      <header className="space-y-3">
        <div className="kurly-kicker">Onboarding</div>
        <h1 className="text-5xl font-semibold">소개의 기본 결을 정리해 주세요</h1>
        <p className="max-w-3xl text-base leading-8 text-slate-600">
          회원가입 후 프로필 작성과 중매자 연결을 진행하는 화면
        </p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {saved ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          온보딩 정보를 저장했습니다.
        </div>
      ) : null}

      {connected ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          중매자 연결이 완료되었습니다.
        </div>
      ) : null}

      <section className="kurly-panel rounded-[2rem] p-7">
        <h2 className="text-lg font-semibold">내 기본 정보</h2>
        <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
          <div>이름: {bundle.profile?.name ?? "-"}</div>
          <div>역할: {bundle.profile?.role ?? "-"}</div>
          <div>성별: {bundle.profile?.gender ?? "-"}</div>
          <div>출생연도: {bundle.profile?.birth_year ?? "-"}</div>
          <div>교회: {bundle.profile?.church_name ?? "-"}</div>
          <div>지역: {bundle.profile?.region_text ?? "-"}</div>
        </div>
      </section>

      <section className="kurly-panel rounded-[2rem] p-7">
        <h2 className="text-lg font-semibold">프로필 작성 상태</h2>
        <div className="mt-4 space-y-2 text-sm text-slate-700">
          <div>상태: {bundle.memberProfile?.profile_status ?? "-"}</div>
          <div>자기소개: {bundle.memberProfile?.intro_name_age ?? "-"}</div>
          <div>하는 일: {bundle.memberProfile?.job_text ?? "-"}</div>
          <div>행복 요소: {bundle.memberProfile?.joy_text ?? "-"}</div>
          <div>연애관: {bundle.memberProfile?.dating_view_text ?? "-"}</div>
          <div>
            선호하는 부분: {toListText(bundle.memberProfile?.preferred_traits ?? [])}
          </div>
          <div>
            절대 안 되는 부분: {toListText(bundle.memberProfile?.deal_breakers ?? [])}
          </div>
          <div>등록 사진 수: {bundle.photos.length}</div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/member/profile/photos"
            className="kurly-button rounded-2xl px-5 py-3 text-sm font-semibold"
          >
            본인 사진 올리기
          </Link>
          <Link
            href="/member/profile"
            className="kurly-outline rounded-2xl px-5 py-3 text-sm font-semibold"
          >
            내 프로필 보기
          </Link>
        </div>
      </section>

      <section className="kurly-panel rounded-[2rem] p-7">
        <OnboardingForm bundle={bundle} />
      </section>

      <section className="kurly-panel rounded-[2rem] p-7">
        <h2 className="text-lg font-semibold">중매자 연결</h2>
        {bundle.matchmakerLinks.length > 0 ? (
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            {bundle.matchmakerLinks.map((link) => (
              <div
                key={link.id}
                className="rounded-[1.4rem] border border-white/8 bg-white/4 p-5"
              >
                <div>중매자 ID: {link.matchmaker_user_id}</div>
                <div>상태: {link.status}</div>
                <div>연결 코드: {link.invited_by_code ?? "-"}</div>
                <div>
                  연결 시각:{" "}
                  {new Date(link.connected_at).toLocaleString("ko-KR")}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-slate-600">
              아직 연결된 중매자가 없습니다. 중매자 코드를 입력해서 연결할 수 있습니다.
            </p>
            <MatchmakerCodeForm />
          </div>
        )}
      </section>
    </main>
  );
}
