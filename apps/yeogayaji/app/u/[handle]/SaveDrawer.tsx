"use client";

import { useEffect, useRef, useState } from "react";
import type { PublicPlace, PlaceTab } from "./types";

type Props = {
  place: PublicPlace;
  viewerTabs: PlaceTab[];
  onClose: () => void;
};

export function SaveDrawer({ place, viewerTabs, onClose }: Props) {
  const [selectedTabId, setSelectedTabId] = useState(
    viewerTabs.find((t) => t.is_default)?.id ?? viewerTabs[0]?.id ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  // 바깥 클릭 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (e.target === backdropRef.current) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // body 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const onSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/places/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          place_name: place.place_name,
          naver_map_link: place.naver_map_link,
          kakao_map_link: place.kakao_map_link,
          description: place.description,
          lat: place.lat,
          lng: place.lng,
          tab_id: selectedTabId || null,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null) as { message?: string } | null;
        alert(payload?.message ?? "저장 실패");
        return;
      }

      setDone(true);
      setTimeout(onClose, 1000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg rounded-t-3xl bg-white px-5 pb-10 pt-5 animate-slide-up">
        {/* 핸들 */}
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#E5E8EB]" />

        <p className="mb-1 text-xs font-medium text-[#6B7684]">내 리스트에 저장</p>
        <p className="mb-5 text-lg font-bold text-[#191F28] truncate">
          {place.place_name?.trim() || "장소"}
        </p>

        {/* 탭 선택 */}
        {viewerTabs.length > 0 && (
          <div className="mb-5">
            <p className="mb-2 text-sm font-medium text-[#4E5968]">저장할 탭</p>
            <div className="flex flex-wrap gap-2">
              {viewerTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTabId(tab.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedTabId === tab.id
                      ? "bg-[#191F28] text-white"
                      : "bg-[#F2F4F6] text-[#4E5968] hover:bg-[#E5E8EB]"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {done ? (
          <div className="flex items-center justify-center rounded-2xl bg-[#F2F4F6] py-4 text-sm font-semibold text-[#191F28]">
            저장됐어요!
          </div>
        ) : (
          <button
            onClick={onSave}
            disabled={saving}
            className="w-full rounded-2xl bg-[#191F28] py-4 text-sm font-bold text-white transition hover:bg-[#2D3540] disabled:opacity-50"
          >
            {saving ? "저장 중…" : "저장하기"}
          </button>
        )}
      </div>
    </div>
  );
}
