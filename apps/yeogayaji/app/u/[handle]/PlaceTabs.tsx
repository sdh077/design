"use client";

import { useState } from "react";
import { PlaceCard } from "./PlaceCard";
import type { PublicPlace, PlaceTab } from "./types";

type Props = {
    tabs: PlaceTab[];
    places: PublicPlace[];
};

export default function PlaceTabs({ tabs, places }: Props) {
    const [activeTabId, setActiveTabId] = useState<string>(
        tabs.find((t) => t.is_default)?.id ?? tabs[0]?.id ?? ""
    );

    const visiblePlaces = places.filter((p) => p.tab_id === activeTabId);

    return (
        <div className="space-y-3">
            {/* 탭 */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTabId(tab.id)}
                        className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                            activeTabId === tab.id
                                ? "bg-[#191F28] text-white"
                                : "bg-white text-[#6B7684] hover:bg-[#E5E8EB]"
                        }`}
                    >
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* 장소 목록 */}
            {visiblePlaces.length === 0 ? (
                <div className="rounded-2xl bg-white px-6 py-10 text-center">
                    <p className="text-sm text-[#B0B8C1]">이 탭에 공개된 추천 장소가 없습니다.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {visiblePlaces.map((place) => (
                        <PlaceCard key={place.id} place={place} />
                    ))}
                </div>
            )}
        </div>
    );
}
