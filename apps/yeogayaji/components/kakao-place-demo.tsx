"use client";

import { useEffect, useRef, useState } from "react";

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

export function KakaoPlaceDemo() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<KakaoPlace[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

    // 기존 마커/인포윈도우 제거
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
        removable: false,
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
    try {
      const res = await fetch(
        `/api/kakao/search?query=${encodeURIComponent(trimmed)}`
      );
      const data = await res.json();
      setResults(data.documents ?? []);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* 왼쪽: 검색 + 결과 */}
      <div className="flex w-80 flex-shrink-0 flex-col gap-3">
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

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {results.length === 0 ? (
            <p className="pt-12 text-center text-sm text-zinc-400">
              장소를 검색해보세요
            </p>
          ) : (
            results.map((place) => {
              const isSelected = selectedId === place.id;
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
                  <p className="text-sm font-semibold">{place.place_name}</p>
                  {place.category_name && (
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {place.category_name.split(" > ").pop()}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-zinc-500">
                    {place.road_address_name || place.address_name}
                  </p>
                  {place.phone && (
                    <p className="mt-0.5 text-xs text-zinc-400">{place.phone}</p>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 오른쪽: 지도 */}
      <div className="relative flex-1 overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800">
        <div ref={mapContainerRef} className="h-full w-full" />
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 text-sm text-zinc-400 dark:bg-zinc-900">
            지도 로딩 중…
          </div>
        )}
      </div>
    </div>
  );
}
