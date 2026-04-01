import type { MemberVisibleMatch } from "@/types/match";

function renderList(items: string[] | undefined) {
  return items && items.length > 0 ? items.join(", ") : "-";
}

export function VisibleProfileCard({ item }: { item: MemberVisibleMatch }) {
  const { counterpart, match, isOpenToViewer } = item;

  if (!isOpenToViewer) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        중매자가 아직 이 소개를 내게 공개하지 않았습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6">
      <section>
        <h2 className="text-lg font-semibold">소개글</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-700">
          <div>이름, 나이: {counterpart.memberProfile?.intro_name_age ?? "-"}</div>
          <div>하는 일: {counterpart.memberProfile?.job_text ?? "-"}</div>
          <div>행복 요소: {counterpart.memberProfile?.joy_text ?? "-"}</div>
          <div>연애관: {counterpart.memberProfile?.dating_view_text ?? "-"}</div>
          <div>
            선호하는 부분: {renderList(counterpart.memberProfile?.preferred_traits)}
          </div>
          <div>
            절대 안 되는 부분: {renderList(counterpart.memberProfile?.deal_breakers)}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">사진</h2>
        {match.current_stage >= 2 ? (
          counterpart.photos.length > 0 ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {counterpart.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
                >
                  {photo.signedUrl ? (
                    <img
                      src={photo.signedUrl}
                      alt="Visible profile"
                      className="h-56 w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-56 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500">
                      이미지를 불러오지 못했습니다.
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">등록된 사진이 없습니다.</p>
          )
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            현재 단계에서는 사진이 아직 공개되지 않았습니다.
          </p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">연락처</h2>
        {match.current_stage >= 3 ? (
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <div>전화번호: {counterpart.memberProfile?.contact_phone ?? "-"}</div>
            <div>카카오톡: {counterpart.memberProfile?.contact_kakao ?? "-"}</div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            현재 단계에서는 연락처가 아직 공개되지 않았습니다.
          </p>
        )}
      </section>
    </div>
  );
}
