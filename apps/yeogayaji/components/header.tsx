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
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between py-3">
        장소추천
        {/* <Link href="/" className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
        </Link> */}

        <nav className="flex items-center gap-2">
          <Link
            href="/places"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            저장/조회
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/following"
                className="rounded-xl px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                팔로잉
              </Link>
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
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

