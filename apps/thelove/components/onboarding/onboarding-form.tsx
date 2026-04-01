import { saveOnboardingAction } from "@/actions/onboarding";
import type { MemberProfileBundle } from "@/types/profile";

type OnboardingFormProps = {
  bundle: MemberProfileBundle;
};

function listToTextarea(items: string[]) {
  return items.join("\n");
}

export function OnboardingForm({ bundle }: OnboardingFormProps) {
  return (
    <form action={saveOnboardingAction} className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">기본 정보</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span>이름</span>
            <input
              name="name"
              defaultValue={bundle.profile?.name ?? ""}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>성별</span>
            <select
              name="gender"
              defaultValue={bundle.profile?.gender ?? ""}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            >
              <option value="">선택</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span>출생연도</span>
            <input
              name="birth_year"
              type="number"
              defaultValue={bundle.profile?.birth_year ?? ""}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>전화번호</span>
            <input
              name="phone"
              defaultValue={bundle.profile?.phone ?? ""}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>교회명</span>
            <input
              name="church_name"
              defaultValue={bundle.profile?.church_name ?? ""}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>교단 / 신앙 정보</span>
            <input
              name="denomination"
              defaultValue={bundle.profile?.denomination ?? ""}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
          <label className="space-y-2 text-sm md:col-span-2">
            <span>거주 지역</span>
            <input
              name="region_text"
              defaultValue={bundle.profile?.region_text ?? ""}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">자기소개 샘플</h2>
        <div className="grid gap-4">
          <label className="space-y-2 text-sm">
            <span>1. 이름, 나이 등등</span>
            <textarea
              name="intro_name_age"
              defaultValue={bundle.memberProfile?.intro_name_age ?? ""}
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>2. 하고 있는 일</span>
            <textarea
              name="job_text"
              defaultValue={bundle.memberProfile?.job_text ?? ""}
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>3. 내 삶을 행복하고 즐겁게 하는 것</span>
            <textarea
              name="joy_text"
              defaultValue={bundle.memberProfile?.joy_text ?? ""}
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>4. 연애관</span>
            <textarea
              name="dating_view_text"
              defaultValue={bundle.memberProfile?.dating_view_text ?? ""}
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">확장 정보</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span>키</span>
            <input
              name="height"
              type="number"
              defaultValue={bundle.memberProfile?.height ?? ""}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>학력 / 전공 등</span>
            <input
              name="education_text"
              defaultValue={bundle.memberProfile?.education_text ?? ""}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
          <label className="space-y-2 text-sm md:col-span-2">
            <span>결혼관</span>
            <textarea
              name="marriage_view_text"
              defaultValue={bundle.memberProfile?.marriage_view_text ?? ""}
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">선호 상대 성향</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span>선호하는 부분 3가지</span>
            <textarea
              name="preferred_traits"
              defaultValue={listToTextarea(
                bundle.memberProfile?.preferred_traits ?? []
              )}
              rows={5}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>절대 안 되는 부분 3가지</span>
            <textarea
              name="deal_breakers"
              defaultValue={listToTextarea(
                bundle.memberProfile?.deal_breakers ?? []
              )}
              rows={5}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">3단계 공개용 연락처</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span>전화번호</span>
            <input
              name="contact_phone"
              defaultValue={bundle.memberProfile?.contact_phone ?? ""}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>카카오톡 ID</span>
            <input
              name="contact_kakao"
              defaultValue={bundle.memberProfile?.contact_kakao ?? ""}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
          <label className="space-y-2 text-sm md:col-span-2">
            <span>프로필 상태</span>
            <select
              name="profile_status"
              defaultValue={bundle.memberProfile?.profile_status ?? "draft"}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            >
              <option value="draft">초안</option>
              <option value="published">공개 가능</option>
              <option value="hidden">숨김</option>
            </select>
          </label>
        </div>
      </section>

      <button className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white">
        온보딩 정보 저장
      </button>
    </form>
  );
}
