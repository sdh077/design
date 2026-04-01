import Link from "next/link";
import { ProfilePreviewCard } from "@/components/profile/profile-preview-card";
import { requireUser } from "@/lib/auth/guard";
import { getMemberProfileBundle } from "@/lib/db/profile";

export default async function MemberProfilePage() {
  const { user } = await requireUser();
  const bundle = await getMemberProfileBundle(user.id);

  return (
    <main className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">내 프로필</h1>
          <p className="mt-2 text-sm text-slate-600">
            중매자와 소개 상대에게 보여질 프로필 내용을 확인합니다.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/member/profile/edit"
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
          >
            프로필 수정
          </Link>
          <Link
            href="/member/profile/photos"
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium"
          >
            사진 관리
          </Link>
        </div>
      </header>

      <ProfilePreviewCard bundle={bundle} />
    </main>
  );
}
