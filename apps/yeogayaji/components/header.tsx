import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./auth-form";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          여기야지
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/places"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            저장/조회
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden text-xs text-zinc-500 dark:text-zinc-400 sm:block">
                {user.email}
              </div>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-xl px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                회원가입
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

