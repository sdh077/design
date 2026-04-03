import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { KakaoPlaceDemo } from "@/components/kakao-place-demo";
import type { PlaceTab } from "@/types/place-tab";

export default async function PlacesKakaoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: tabsData } = await supabase
    .from("place_tabs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const tabs = (tabsData ?? []) as PlaceTab[];

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            카카오 장소 검색 (비교용)
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            장소명으로 검색 → 지도에서 확인 → 저장하는 방식입니다.
          </p>
        </div>
        <Link
          href="/places"
          className="rounded-2xl border border-zinc-200 px-4 py-2 text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          ← 기존 방식 보기
        </Link>
      </div>

      <KakaoPlaceDemo tabs={tabs} />
    </main>
  );
}
