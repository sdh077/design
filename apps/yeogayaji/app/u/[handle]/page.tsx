import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PlaceTabs from "./PlaceTabs";
import PlaceMap from "./PlaceMap";
import { PlaceCard } from "./PlaceCard";
import { FollowButton } from "./FollowButton";
import type { PublicPlace, PlaceTab } from "./types";

type PublicProfile = {
    id: string;
    handle: string;
    display_name: string | null;
    bio: string | null;
    is_public: boolean;
};

export default async function PublicUserPage({
    params,
}: {
    params: Promise<{ handle: string }>;
}) {
    const { handle } = await params;
    const supabase = await createClient();

    // 현재 로그인한 뷰어 정보
    const { data: { user: viewer } } = await supabase.auth.getUser();

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, handle, display_name, bio, is_public")
        .eq("handle", handle)
        .eq("is_public", true)
        .maybeSingle<PublicProfile>();

    if (profileError || !profile) {
        notFound();
    }

    const [{ data: rawTabs }, { data: rawPlaces, error: placesError }] = await Promise.all([
        supabase
            .from("place_tabs")
            .select("id, name, is_default")
            .eq("user_id", profile.id)
            .order("created_at", { ascending: true }),
        supabase
            .from("places")
            .select("id, place_name, naver_map_link, kakao_map_link, description, sort_order, created_at, tab_id, lat, lng")
            .eq("user_id", profile.id)
            .eq("is_recommended", true)
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: false }),
    ]);

    if (placesError) notFound();

    const tabs = (rawTabs as PlaceTab[] | null) ?? [];
    const places = (rawPlaces as PublicPlace[] | null) ?? [];

    // 뷰어 탭 (로그인한 경우 + 본인 페이지가 아닌 경우)
    let viewerTabs: PlaceTab[] = [];
    let isFollowing = false;
    if (viewer && viewer.id !== profile.id) {
        const [{ data: vTabs }, { data: followRow }] = await Promise.all([
            supabase
                .from("place_tabs")
                .select("id, name, is_default")
                .eq("user_id", viewer.id)
                .order("created_at", { ascending: true }),
            supabase
                .from("follows")
                .select("id")
                .eq("follower_id", viewer.id)
                .eq("following_id", profile.id)
                .maybeSingle(),
        ]);
        viewerTabs = (vTabs as PlaceTab[] | null) ?? [];
        isFollowing = !!followRow;
    }

    const mappablePlaces = places.filter(
        (p): p is PublicPlace & { lat: number; lng: number } =>
            p.lat !== null && p.lng !== null
    );

    return (
        <div className="min-h-screen bg-[#F2F4F6]">
            {/* 프로필 헤더 */}
            <div className="bg-white px-5 pb-6 pt-10">
                <div className="mx-auto max-w-lg">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="mb-1 text-xs font-medium text-[#6B7684]">@{profile.handle}</p>
                            <h1 className="text-2xl font-bold tracking-tight text-[#191F28]">
                                {profile.display_name || `${profile.handle}의 추천 리스트`}
                            </h1>
                            {profile.bio && (
                                <p className="mt-2 text-sm leading-relaxed text-[#6B7684]">{profile.bio}</p>
                            )}
                        </div>
                        {viewer && viewer.id !== profile.id && (
                            <FollowButton followingId={profile.id} initialFollowing={isFollowing} />
                        )}
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-lg px-5 pb-16 pt-4 space-y-4">
                {places.length === 0 ? (
                    <div className="rounded-2xl bg-white px-6 py-12 text-center">
                        <p className="text-sm text-[#B0B8C1]">아직 공개된 추천 장소가 없습니다.</p>
                    </div>
                ) : (
                    <>
                        {/* 지도 */}
                        {mappablePlaces.length > 0 && (
                            <PlaceMap places={mappablePlaces} />
                        )}

                        {/* 탭 + 목록 */}
                        {tabs.length > 0 ? (
                            <PlaceTabs tabs={tabs} places={places} viewerTabs={viewerTabs.length > 0 ? viewerTabs : undefined} />
                        ) : (
                            <PlaceList places={places} viewerTabs={viewerTabs.length > 0 ? viewerTabs : undefined} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function PlaceList({ places, viewerTabs }: { places: PublicPlace[]; viewerTabs?: PlaceTab[] }) {
    return (
        <div className="space-y-3">
            {places.map((place) => (
                <PlaceCard key={place.id} place={place} viewerTabs={viewerTabs} />
            ))}
        </div>
    );
}

