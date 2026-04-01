import { PreferenceFields } from "@/components/profile/preference-fields";
import type { MemberProfileBundle } from "@/types/profile";

export function ProfilePreviewCard({
  bundle,
  title = "내 프로필 미리보기",
}: {
  bundle: MemberProfileBundle;
  title?: string;
}) {
  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6">
      <header>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">
          현재 입력된 소개와 선호 조건을 한 번에 확인합니다.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-5">
          <h3 className="text-base font-semibold">기본 정보</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <div>이름: {bundle.profile?.name ?? "-"}</div>
            <div>성별: {bundle.profile?.gender ?? "-"}</div>
            <div>출생연도: {bundle.profile?.birth_year ?? "-"}</div>
            <div>교회: {bundle.profile?.church_name ?? "-"}</div>
            <div>지역: {bundle.profile?.region_text ?? "-"}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5">
          <h3 className="text-base font-semibold">연락처 / 상태</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <div>프로필 상태: {bundle.memberProfile?.profile_status ?? "-"}</div>
            <div>전화번호: {bundle.memberProfile?.contact_phone ?? "-"}</div>
            <div>카카오톡: {bundle.memberProfile?.contact_kakao ?? "-"}</div>
            <div>사진 수: {bundle.photos.length}</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 p-5">
        <h3 className="text-base font-semibold">자기소개</h3>
        <div className="mt-3 space-y-3 text-sm text-slate-700">
          <div>이름, 나이: {bundle.memberProfile?.intro_name_age ?? "-"}</div>
          <div>하는 일: {bundle.memberProfile?.job_text ?? "-"}</div>
          <div>행복 요소: {bundle.memberProfile?.joy_text ?? "-"}</div>
          <div>연애관: {bundle.memberProfile?.dating_view_text ?? "-"}</div>
          <div>결혼관: {bundle.memberProfile?.marriage_view_text ?? "-"}</div>
        </div>
      </div>

      <PreferenceFields
        preferredTraits={bundle.memberProfile?.preferred_traits ?? []}
        dealBreakers={bundle.memberProfile?.deal_breakers ?? []}
      />
    </section>
  );
}
