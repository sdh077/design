"use client";

import { useEffect, useRef, useState } from "react";

type PlaceWithCoords = {
  id: string;
  place_name: string | null;
  naver_map_link: string;
  lat: number;
  lng: number;
};

declare global {
  interface Window {
    kakao: any;
  }
}

export default function PlaceMap({ places }: { places: PlaceWithCoords[] }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!show) return;
    if (typeof window === "undefined") return;

    const init = () => {
      if (!mapContainerRef.current) return;
      if (mapRef.current) {
        // 이미 초기화됨 — 마커만 다시 그리기
        renderMarkers();
        return;
      }
      mapRef.current = new window.kakao.maps.Map(mapContainerRef.current, {
        center: new window.kakao.maps.LatLng(places[0].lat, places[0].lng),
        level: 7,
      });
      renderMarkers();
    };

    const renderMarkers = () => {
      const bounds = new window.kakao.maps.LatLngBounds();
      places.forEach((place) => {
        const position = new window.kakao.maps.LatLng(place.lat, place.lng);
        const marker = new window.kakao.maps.Marker({ position, map: mapRef.current });
        const iw = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:6px 10px;font-size:12px;white-space:nowrap;font-weight:600">${place.place_name ?? "장소"}</div>`,
        });
        window.kakao.maps.event.addListener(marker, "click", () => iw.open(mapRef.current, marker));
        bounds.extend(position);
      });
      if (places.length > 1) mapRef.current.setBounds(bounds);
    };

    if (window.kakao?.maps) {
      init();
      return;
    }

    const jsKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
    if (!jsKey) return;

    const existing = document.querySelector(`script[src*="dapi.kakao.com"]`);
    if (existing) {
      existing.addEventListener("load", () => window.kakao.maps.load(() => { setMapReady(true); init(); }));
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${jsKey}&autoload=false`;
    script.onload = () => window.kakao.maps.load(() => { setMapReady(true); init(); });
    document.head.appendChild(script);
  }, [show, places]);

  if (places.length === 0) return null;

  return (
    <div className="mb-8">
      <button
        onClick={() => setShow((v) => !v)}
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/10"
      >
        {show ? "목록으로 보기" : "지도로 보기"}
      </button>

      {show && (
        <div className="relative h-[420px] overflow-hidden rounded-3xl border border-white/10 md:h-[560px]">
          <div ref={mapContainerRef} className="absolute inset-0" />
          {!mapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 text-sm text-white/40">
              지도 로딩 중…
            </div>
          )}
        </div>
      )}
    </div>
  );
}
