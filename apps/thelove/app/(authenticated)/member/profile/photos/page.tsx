import { MemberPhotoUploader } from "@/components/profile/member-photo-uploader";
import { requireUser } from "@/lib/auth/guard";
import { getMemberPhotoAssets } from "@/lib/db/profile";

export default async function MemberProfilePhotosPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user } = await requireUser();
  const photos = await getMemberPhotoAssets(user.id);
  const params = (await searchParams) ?? {};
  const error =
    typeof params.error === "string" ? decodeURIComponent(params.error) : null;
  const uploaded = params.uploaded === "1";
  const primaryUpdated = params.primaryUpdated === "1";
  const reordered = params.reordered === "1";
  const deleted = params.deleted === "1";

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">프로필 사진 관리</h1>
        <p className="mt-2 text-sm text-slate-600">
          중매 단계 2부터 공개될 사진을 업로드하고 대표 사진을 정할 수 있습니다.
        </p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {uploaded ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          사진을 업로드했습니다.
        </div>
      ) : null}
      {primaryUpdated ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          대표 사진을 변경했습니다.
        </div>
      ) : null}
      {reordered ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          사진 순서를 변경했습니다.
        </div>
      ) : null}
      {deleted ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          사진을 삭제했습니다.
        </div>
      ) : null}

      <MemberPhotoUploader photos={photos} />
    </main>
  );
}
