import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { KakaoPlaceDemo } from "@/components/kakao-place-demo";
import { PlaceTabs } from "@/components/place-tabs";
import { PlaceList } from "@/components/place-list";
import { PublicProfileForm } from "@/components/public-profile-form";
import type { Place } from "@/types/place";
import type { PlaceTab } from "@/types/place-tab";
import type { Profile } from "@/types/profile";

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
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-2xl font-semibold">로그인 필요</h1>
        <p className="mt-2 text-sm text-zinc-500">
          네이버 지도 링크 저장/조회는 로그인 후 이용할 수 있어요.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white"
        >
          로그인하기
        </Link>
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
    return <div>탭 목록을 불러오지 못했습니다: {tabsError.message}</div>;
  }

  let tabs = (tabsData ?? []) as PlaceTab[];

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
      return <div>기본탭 생성 실패: {createError?.message ?? "알 수 없는 오류"}</div>;
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
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const { data, error } =
    defaultTab.id === selectedTabId
      ? await placesQuery.or(`tab_id.eq.${selectedTabId},tab_id.is.null`)
      : await placesQuery.eq("tab_id", selectedTabId);

  if (error) {
    return <div>목록을 불러오지 못했습니다: {error.message}</div>;
  }

  const places = (data ?? []) as Place[];

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileData as Profile | null;

  const publicUrlBase =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="space-y-8">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight">내 장소</h1>
          <p className="mt-2 text-sm text-zinc-500">
            카카오 장소 검색으로 추가하고 공개 추천 페이지로 공유해보세요.
          </p>
        </section>

        <PublicProfileForm
          initialHandle={profile?.handle ?? ""}
          initialDisplayName={profile?.display_name ?? ""}
          initialBio={profile?.bio ?? ""}
          initialIsPublic={profile?.is_public ?? false}
          publicUrlBase={publicUrlBase}
        />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">장소 추가</h2>
          <KakaoPlaceDemo tabs={tabs} />
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">저장된 장소</h2>
          <PlaceTabs tabs={tabs} selectedTabId={selectedTabId} />
          <PlaceList places={places} />
        </section>
      </div>
    </main>
  );
}
