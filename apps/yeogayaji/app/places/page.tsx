import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlaceForm } from "@/components/place-form";
import { PlaceList } from "@/components/place-list";
import { PlaceTabs } from "@/components/place-tabs";
import type { Place } from "@/types/place";
import type { PlaceTab } from "@/types/place-tab";

export default async function PlacesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            로그인 필요
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            네이버 지도 링크 저장/조회는 로그인 후 이용할 수 있어요.
          </p>
          <div className="mt-5">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              로그인하기
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { tab } = await searchParams;

  const { data: tabsData, error: tabsError } = await supabase
    .from("place_tabs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (tabsError) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-100">
          탭 목록을 불러오지 못했습니다: {tabsError.message}
        </div>
      </main>
    );
  }

  let tabs = (tabsData ?? []) as PlaceTab[];

  // 사용자가 처음 들어오는 경우 기본탭을 만들어둡니다.
  if (!tabs.length) {
    const { data: created, error: createError } = await supabase
      .from("place_tabs")
      .insert({
        user_id: user.id,
        name: "기본탭",
        is_default: true,
      })
      .select("*")
      .single();

    if (createError || !created) {
      return (
        <main className="mx-auto w-full max-w-3xl px-4 py-10">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-100">
            기본탭 생성 실패: {createError?.message ?? "알 수 없는 오류"}
          </div>
        </main>
      );
    }

    tabs = [created as PlaceTab];
  }

  const defaultTab = tabs.find((t) => t.is_default) ?? tabs[0];
  const selectedTab =
    tab && tabs.some((t) => t.id === tab) ? tabs.find((t) => t.id === tab) : null;

  if (!selectedTab) {
    redirect(`/places?tab=${encodeURIComponent(defaultTab.id)}`);
  }

  const selectedTabId = selectedTab.id;

  const placesQuery = supabase
    .from("places")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data, error } = defaultTab.id === selectedTabId
    ? await placesQuery.or(
        `tab_id.eq.${selectedTabId},tab_id.is.null`
      )
    : await placesQuery.eq("tab_id", selectedTabId);

  if (error) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-100">
          목록을 불러오지 못했습니다: {error.message}
        </div>
      </main>
    );
  }

  const places = (data ?? []) as Place[];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="space-y-6">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            네이버 지도 링크 저장
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            아래에 `https://naver.me/...` 형태의 링크를 붙여넣으면 저장됩니다.
          </p>
          <div className="mt-4">
            <PlaceForm tabs={tabs} selectedTabId={selectedTabId} />
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            저장된 링크 (탭)
          </h2>
          <div className="mt-4">
            <PlaceTabs tabs={tabs} selectedTabId={selectedTabId} />
          </div>
          <div className="mt-4">
            <PlaceList places={places} />
          </div>
        </section>
      </div>
    </main>
  );
}

