"use client";

import { useState } from "react";
import { SaveDrawer } from "./SaveDrawer";
import type { PublicPlace, PlaceTab } from "./types";

export function PlaceCard({
  place,
  viewerTabs,
  onSelect,
}: {
  place: PublicPlace;
  viewerTabs?: PlaceTab[];
  onSelect?: (id: string) => void;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <div className="rounded-2xl bg-white p-5 cursor-pointer" onClick={() => onSelect?.(place.id)}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-[#191F28]">
              {place.place_name?.trim() || "장소"}
            </p>
            {place.description && (
              <p className="mt-1 text-sm leading-relaxed text-[#6B7684] whitespace-pre-line">
                {place.description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-col gap-1.5">
            {place.kakao_map_link && (
              <a
                href={place.kakao_map_link}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[#FEE500] px-4 py-2 text-center text-xs font-semibold text-[#191F28] transition hover:brightness-95"
              >
                카카오맵
              </a>
            )}
            {place.naver_map_link && (
              <a
                href={place.naver_map_link}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[#03C75A] px-4 py-2 text-center text-xs font-semibold text-white transition hover:brightness-95"
              >
                네이버 지도
              </a>
            )}
            {viewerTabs && (
              <button
                onClick={() => setDrawerOpen(true)}
                className="rounded-full bg-[#F2F4F6] px-4 py-2 text-center text-xs font-semibold text-[#4E5968] transition hover:bg-[#E5E8EB]"
              >
                저장
              </button>
            )}
          </div>
        </div>
      </div>

      {drawerOpen && viewerTabs && (
        <SaveDrawer
          place={place}
          viewerTabs={viewerTabs}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </>
  );
}
