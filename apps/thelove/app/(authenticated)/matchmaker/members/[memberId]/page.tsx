import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guard";
import { getConnectedMembersForMatchmaker } from "@/lib/db/matches";
import { getMemberPhotoAssets, getMemberProfileBundle } from "@/lib/db/profile";
import { PreferenceFields } from "@/components/profile/preference-fields";

export default async function MatchmakerMemberDetailPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const { profile } = await requireRole(["matchmaker", "admin"]);
  const members = await getConnectedMembersForMatchmaker(profile.id);
  const member = members.find((row) => row.id === memberId);
  const [bundle, photos] = await Promise.all([
    getMemberProfileBundle(memberId),
    getMemberPhotoAssets(memberId),
  ]);

  if (!member) {
    notFound();
  }

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">
          {member.name ?? "이름 미입력"} 회원 상세
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          매칭 후보 검토를 위한 기본 정보입니다.
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-2">
          <div>성별: {member.gender ?? "-"}</div>
          <div>프로필 상태: {member.profileStatus ?? "-"}</div>
          <div>교회: {member.churchName ?? "-"}</div>
          <div>지역: {member.regionText ?? "-"}</div>
          <div>
            연결일: {new Date(member.connectedAt).toLocaleString("ko-KR")}
          </div>
          <div>회원 ID: {member.id}</div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold">소개글</h2>
          <div className="mt-3 space-y-3 text-sm text-slate-700">
            <div>이름, 나이: {bundle.memberProfile?.intro_name_age ?? "-"}</div>
            <div>하는 일: {bundle.memberProfile?.job_text ?? "-"}</div>
            <div>행복 요소: {bundle.memberProfile?.joy_text ?? "-"}</div>
            <div>연애관: {bundle.memberProfile?.dating_view_text ?? "-"}</div>
            <div>결혼관: {bundle.memberProfile?.marriage_view_text ?? "-"}</div>
          </div>
        </div>
      </section>

      <PreferenceFields
        preferredTraits={bundle.memberProfile?.preferred_traits ?? []}
        dealBreakers={bundle.memberProfile?.deal_breakers ?? []}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">프로필 사진</h2>
        {photos.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">등록된 사진이 없습니다.</p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="rounded-2xl border border-slate-200 p-4"
              >
                {photo.signedUrl ? (
                  <img
                    src={photo.signedUrl}
                    alt="Member profile"
                    className="h-64 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500">
                    이미지를 불러오지 못했습니다.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
