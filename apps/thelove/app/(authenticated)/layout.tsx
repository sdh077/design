import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import { requireUser } from "@/lib/auth/guard";
import { getProfileByUserId } from "@/lib/db/profile";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireUser();
  const profile = await getProfileByUserId(user.id);

  return (
    <div className="kurly-shell min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto min-h-screen max-w-7xl px-6 py-8">
        <header className="kurly-panel mb-6 flex items-center justify-between rounded-[2rem] px-6 py-5">
          <div>
            <div className="kurly-kicker">Private Introduction</div>
            <div className="mt-2 text-3xl font-semibold">theLove</div>
            <div className="mt-1 text-sm text-slate-600">
              {profile?.name ?? "이름 미입력"} · {profile?.role ?? "member"}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/onboarding"
              className="kurly-outline rounded-2xl px-4 py-2.5 text-sm font-medium"
            >
              온보딩
            </Link>
            <form action={logoutAction}>
              <button className="kurly-button rounded-2xl px-4 py-2.5 text-sm font-medium">
                로그아웃
              </button>
            </form>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
