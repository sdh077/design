import { MemberProfileForm } from "@/components/profile/member-profile-form";
import { requireUser } from "@/lib/auth/guard";
import { getMemberProfileBundle } from "@/lib/db/profile";

export default async function MemberProfileEditPage({
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

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">프로필 수정</h1>
        <p className="mt-2 text-sm text-slate-600">
          온보딩에서 작성한 내용을 언제든 수정할 수 있습니다.
        </p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {saved ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          프로필을 저장했습니다.
        </div>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <MemberProfileForm bundle={bundle} />
      </section>
    </main>
  );
}
