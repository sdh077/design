"use client";

import Link from "next/link";
import { useState } from "react";

type PlaceTab = {
    id: string;
    name: string;
    is_default: boolean;
};

type PublicPlace = {
    id: string;
    place_name: string | null;
    naver_map_link: string;
    description: string | null;
    sort_order: number;
    created_at: string;
    tab_id: string | null;
};

type Props = {
    tabs: PlaceTab[];
    places: PublicPlace[];
};

export default function PlaceTabs({ tabs, places }: Props) {
    const [activeTabId, setActiveTabId] = useState<string | null>(
        tabs.find((t) => t.is_default)?.id ?? tabs[0]?.id ?? null
    );

    const visiblePlaces =
        activeTabId === null
            ? places
            : places.filter((p) => p.tab_id === activeTabId);

    return (
        <div>
            {/* 탭 버튼 */}
            <div className="mb-6 flex gap-2 flex-wrap">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTabId(tab.id)}
                        className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                            activeTabId === tab.id
                                ? "bg-white text-black"
                                : "border border-white/20 text-white/60 hover:border-white/40 hover:text-white"
                        }`}
                    >
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* 장소 목록 */}
            <div className="grid gap-4">
                {visiblePlaces.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-sm text-white/50">
                        이 탭에 공개된 추천 장소가 없습니다.
                    </div>
                ) : (
                    visiblePlaces.map((place, index) => (
                        <article
                            key={place.id}
                            className="group rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
                        >
                            <div className="mb-3 flex items-start justify-between gap-4">
                                <div>
                                    <p className="mb-2 text-xs text-white/40">추천 {index + 1}</p>
                                    <h3 className="text-xl font-medium">
                                        {place.place_name?.trim() || "네이버 지도 추천 장소"}
                                    </h3>
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
                )}
            </div>
        </div>
    );
}
