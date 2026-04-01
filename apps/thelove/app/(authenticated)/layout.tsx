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
      <div className="safe-px mx-auto min-h-screen max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
        <header className="kurly-panel mb-5 flex flex-col gap-4 rounded-[1.75rem] px-4 py-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div className="min-w-0">
            <div className="kurly-kicker">Private Introduction</div>
            <div className="mt-2 text-2xl font-semibold sm:text-3xl">theLove</div>
            <div className="mt-1 break-words text-sm text-slate-600">
              {profile?.name ?? "이름 미입력"} · {profile?.role ?? "member"}
            </div>
          </div>

          <div className="grid w-full gap-2 sm:flex sm:w-auto sm:items-center sm:justify-end sm:gap-3">
            <Link
              href="/onboarding"
              className="kurly-outline rounded-2xl px-4 py-3 text-center text-sm font-medium"
            >
              온보딩
            </Link>
            <form action={logoutAction}>
              <button className="kurly-button w-full rounded-2xl px-4 py-3 text-sm font-medium">
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
