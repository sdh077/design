"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PlaceTab } from "@/types/place-tab";

type KakaoPlace = {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  phone: string;
  place_url: string;
  category_name: string;
  x: string; // lng
  y: string; // lat
};

declare global {
  interface Window {
    kakao: any;
  }
}

export function KakaoPlaceDemo({ tabs }: { tabs: PlaceTab[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<KakaoPlace[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 저장 관련
  const [savingId, setSavingId] = useState<string | null>(null);
  const [tabId, setTabId] = useState<string>(tabs[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infowindowsRef = useRef<any[]>([]);
  const [mapReady, setMapReady] = useState(false);

  // Kakao Maps JS SDK 로드
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.kakao?.maps) {
      setMapReady(true);
      return;
    }
    const jsKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
    if (!jsKey) {
      console.error("NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY가 설정되지 않았습니다.");
      return;
    }
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${jsKey}&autoload=false`;
    script.onload = () => window.kakao.maps.load(() => setMapReady(true));
    document.head.appendChild(script);
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!mapReady || !mapContainerRef.current || mapRef.current) return;
    mapRef.current = new window.kakao.maps.Map(mapContainerRef.current, {
      center: new window.kakao.maps.LatLng(37.5665, 126.978),
      level: 7,
    });
  }, [mapReady]);

  // 검색 결과 마커 업데이트
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    markersRef.current.forEach((m) => m.setMap(null));
    infowindowsRef.current.forEach((iw) => iw.close());
    markersRef.current = [];
    infowindowsRef.current = [];

    if (results.length === 0) return;

    const bounds = new window.kakao.maps.LatLngBounds();

    results.forEach((place, idx) => {
      const position = new window.kakao.maps.LatLng(
        parseFloat(place.y),
        parseFloat(place.x)
      );
      const marker = new window.kakao.maps.Marker({ position, map: mapRef.current });
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:6px 10px;font-size:12px;white-space:nowrap;font-weight:600">${place.place_name}</div>`,
      });

      window.kakao.maps.event.addListener(marker, "click", () => {
        infowindowsRef.current.forEach((iw) => iw.close());
        infowindow.open(mapRef.current, marker);
        setSelectedId(place.id);
      });

      markersRef.current[idx] = marker;
      infowindowsRef.current[idx] = infowindow;
      bounds.extend(position);
    });

    mapRef.current.setBounds(bounds);
  }, [results, mapReady]);

  // 목록에서 선택 시 해당 마커 포커스
  useEffect(() => {
    if (!selectedId || !mapReady || !mapRef.current) return;
    const idx = results.findIndex((p) => p.id === selectedId);
    if (idx === -1) return;

    const place = results[idx];
    const position = new window.kakao.maps.LatLng(
      parseFloat(place.y),
      parseFloat(place.x)
    );
    mapRef.current.panTo(position);
    infowindowsRef.current.forEach((iw) => iw.close());
    infowindowsRef.current[idx]?.open(mapRef.current, markersRef.current[idx]);
  }, [selectedId, results, mapReady]);

  const onSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed || searching) return;
    setSearching(true);
    setSelectedId(null);
    setSaveError(null);
    try {
      const res = await fetch(`/api/kakao/search?query=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      setResults(data.documents ?? []);
    } finally {
      setSearching(false);
    }
  };

  const onSave = async (place: KakaoPlace) => {
    setSavingId(place.id);
    setSaveError(null);
    try {
      const res = await fetch("/api/places/kakao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          place_name: place.place_name,
          place_url: place.place_url,
          address: place.road_address_name || place.address_name,
          description: description.trim() || null,
          tab_id: tabId || null,
          lat: parseFloat(place.y),
          lng: parseFloat(place.x),
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null) as { message?: string } | null;
        throw new Error(payload?.message ?? "저장 실패");
      }

      setSavedIds((prev) => new Set(prev).add(place.id));
      setDescription("");
      router.refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSavingId(null);
    }
  };

  const selectedPlace = results.find((p) => p.id === selectedId) ?? null;

  // 저장 패널 (모바일/데스크탑 공통)
  const SavePanel = selectedPlace ? (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{selectedPlace.place_name}</p>
          <p className="mt-0.5 text-xs text-zinc-400">
            {selectedPlace.road_address_name || selectedPlace.address_name}
          </p>
        </div>
        <a
          href={selectedPlace.place_url}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          카카오맵 보기
        </a>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.length > 0 && (
          <select
            value={tabId}
            onChange={(e) => setTabId(e.target.value)}
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            {tabs.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        )}
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="한줄 추천 이유 (선택)"
          className="min-w-0 flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900"
        />
        <button
          onClick={() => onSave(selectedPlace)}
          disabled={savingId === selectedPlace.id || savedIds.has(selectedPlace.id)}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {savingId === selectedPlace.id
            ? "저장 중…"
            : savedIds.has(selectedPlace.id)
            ? "저장됨"
            : "저장"}
        </button>
      </div>
      {saveError && <p className="mt-2 text-xs text-red-500">{saveError}</p>}
    </div>
  ) : null;

  // 검색창
  const SearchBar = (
    <div className="flex gap-2">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        placeholder="장소 검색 (예: 성수동 카페)"
        className="flex-1 rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900"
      />
      <button
        onClick={onSearch}
        disabled={searching}
        className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {searching ? "…" : "검색"}
      </button>
    </div>
  );

  // 결과 목록
  const ResultList = (
    <div className="space-y-2">
      {results.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-400">장소를 검색해보세요</p>
      ) : (
        results.map((place) => {
          const isSelected = selectedId === place.id;
          const isSaved = savedIds.has(place.id);
          return (
            <button
              key={place.id}
              onClick={() => setSelectedId(place.id)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                isSelected
                  ? "border-zinc-900 bg-zinc-100 dark:border-white dark:bg-zinc-800"
                  : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold">{place.place_name}</p>
                {isSaved && (
                  <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                    저장됨
                  </span>
                )}
              </div>
              {place.category_name && (
                <p className="mt-0.5 text-xs text-zinc-400">
                  {place.category_name.split(" > ").pop()}
                </p>
              )}
              <p className="mt-1 text-xs text-zinc-500">
                {place.road_address_name || place.address_name}
              </p>
            </button>
          );
        })
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {SearchBar}

      <div className="flex flex-col gap-4 md:flex-row md:gap-6 md:h-[calc(100vh-12rem)]">
        {/* 지도 + 저장 패널 — 모바일: 위, 데스크탑: 오른쪽 */}
        <div className="flex flex-col gap-4 md:order-2 md:flex-1 md:min-w-0">
          <div className="relative h-64 overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 md:flex-1 md:h-auto">
            <div ref={mapContainerRef} className="absolute inset-0" />
            {!mapReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 text-sm text-zinc-400 dark:bg-zinc-900">
                지도 로딩 중…
              </div>
            )}
          </div>
          {SavePanel}
        </div>

        {/* 결과 목록 — 모바일: 아래, 데스크탑: 왼쪽 */}
        <div className="md:order-1 md:w-80 md:flex-shrink-0 md:overflow-y-auto md:pr-1">
          {ResultList}
        </div>
      </div>
    </div>
  );
}
