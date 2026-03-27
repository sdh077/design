import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/places");

  // Public 인기 리스트(실패하면 빈 배열)
  let popular: Array<{
    naver_map_code: string;
    place_name: string | null;
    count: number;
    naver_map_link: string;
  }> = [];

  try {
    // same-origin fetch (SSR)
    const res = await fetch("/api/public/popular-places?limit=8", {
      cache: "no-store",
    });
    const json = (await res.json()) as { places?: typeof popular };
    popular = json.places ?? [];
  } catch {
    popular = [];
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="space-y-8">
        <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              여기야지
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              네이버 지도 링크를 탭별로 저장하고, 나중에 빠르게 찾아보세요.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              로그인
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                최근 인기있는 위치
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                사람들이 많이 저장한 링크를 모아봤어요.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {popular.length ? (
              popular.map((p) => (
                <a
                  key={p.naver_map_code}
                  href={p.naver_map_link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {p.place_name?.trim() ? p.place_name : "네이버 지도"}
                    </div>
                    <div className="break-all text-xs text-zinc-500 dark:text-zinc-400">
                      {p.naver_map_link}
                    </div>
                  </div>
                  <div className="shrink-0 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                    {p.count} 저장
                  </div>
                </a>
              ))
            ) : (
              <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                아직 인기 위치를 집계할 데이터가 없어요. 로그인 후 링크를 저장해보세요.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
