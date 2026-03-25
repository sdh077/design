import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/places");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          네이버 지도 링크를 저장하고, 다시 찾으세요
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          링크를 저장하면 로그인한 사용자 기준으로 목록을 조회할 수
          있습니다. 예: <span className="font-mono">https://naver.me/5Kb3kUc8</span>
        </p>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            로그인하기
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            회원가입
          </Link>
        </div>
      </div>
    </main>
  );
}
