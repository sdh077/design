import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PublicProfile = {
    id: string;
    handle: string;
    display_name: string | null;
    bio: string | null;
    is_public: boolean;
};

type PublicPlace = {
    id: string;
    place_name: string | null;
    naver_map_link: string;
    description: string | null;
    sort_order: number;
    created_at: string;
};

export default async function PublicUserPage({
    params,
}: {
    params: Promise<{ handle: string }>;
}) {
    const { handle } = await params;
    const supabase = await createClient();

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, handle, display_name, bio, is_public")
        .eq("handle", handle)
        .eq("is_public", true)
        .maybeSingle<PublicProfile>();

    if (profileError) {
        return (
            <main className="mx-auto max-w-4xl px-6 py-16">
                <p className="text-sm text-red-500">
                    프로필을 불러오지 못했습니다: {profileError.message}
                </p>
            </main>
        );
    }

    if (!profile) {
        notFound();
    }

    const { data: places, error: placesError } = await supabase
        .from("places")
        .select("id, place_name, naver_map_link, description, sort_order, created_at")
        .eq("user_id", profile.id)
        .eq("is_recommended", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })
        .returns<PublicPlace[]>();

    if (placesError) {
        return (
            <main className="mx-auto max-w-4xl px-6 py-16">
                <p className="text-sm text-red-500">
                    추천 리스트를 불러오지 못했습니다: {placesError.message}
                </p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <section className="mx-auto max-w-4xl px-6 py-16">
                <div className="mb-10 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        {profile.display_name || `${profile.handle}의 추천 리스트`}
                    </h1>
                </div>

                <div className="grid gap-4">
                    {places && places.length > 0 ? (
                        places.map((place, index) => (
                            <article
                                key={place.id}
                                className="group rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
                            >
                                <div className="mb-3 flex items-start justify-between gap-4">
                                    <div>
                                        <p className="mb-2 text-xs text-white/40">
                                            추천 {index + 1}
                                        </p>
                                        <h2 className="text-xl font-medium">
                                            {place.place_name?.trim() || "네이버 지도 추천 장소"}
                                        </h2>
                                    </div>
                                </div>

                                {place.description ? (
                                    <p className="mb-5 text-sm leading-6 text-white/70 whitespace-pre-line">
                                        {place.description}
                                    </p>
                                ) : null}

                                <Link
                                    href={place.naver_map_link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white hover:text-black"
                                >
                                    네이버 지도 보기
                                </Link>
                            </article>
                        ))
                    ) : (
                        <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-sm text-white/50">
                            아직 공개된 추천 장소가 없습니다.
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}