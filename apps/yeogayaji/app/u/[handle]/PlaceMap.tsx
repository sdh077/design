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
  interface Window { kakao: any; }
}

export default function PlaceMap({ places, selectedPlaceId }: { places: PlaceWithCoords[]; selectedPlaceId?: string | null }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (!show) return;
    if (typeof window === "undefined") return;

    const renderMarkers = () => {
      // 기존 마커 전부 제거
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      places.forEach((place) => {
        const position = new window.kakao.maps.LatLng(place.lat, place.lng);
        const marker = new window.kakao.maps.Marker({ position, map: mapRef.current });
        const iw = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:6px 10px;font-size:12px;white-space:nowrap;font-weight:600;color:#191F28;background:#fff;border-radius:6px">${place.place_name ?? "장소"}</div>`,
        });
        window.kakao.maps.event.addListener(marker, "click", () => iw.open(mapRef.current, marker));
        markersRef.current.push(marker);
      });
    };

    const init = () => {
      if (!mapContainerRef.current) return;
      if (!mapRef.current) {
        mapRef.current = new window.kakao.maps.Map(mapContainerRef.current, {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780),
          level: 8,
        });
      }
      renderMarkers();
    };

    if (window.kakao?.maps) {
      setMapReady(true);
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

  useEffect(() => {
    if (!selectedPlaceId || !mapRef.current) return;
    const place = places.find((p) => p.id === selectedPlaceId);
    if (!place) return;
    mapRef.current.panTo(new window.kakao.maps.LatLng(place.lat, place.lng));
  }, [selectedPlaceId, places]);

  // places가 없어도 컨테이너는 유지 (mapRef 보존), 시각적으로만 숨김
  return (
    <div className="space-y-3">
      <div
        className="relative overflow-hidden rounded-2xl bg-white"
        style={{ height: show && places.length > 0 ? 320 : 0, transition: "height 0.3s ease" }}
      >
        <div ref={mapContainerRef} className="absolute inset-0" />
        {show && !mapReady && places.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F2F4F6] text-sm text-[#B0B8C1]">
            지도 로딩 중…
          </div>
        )}
      </div>
      {places.length > 0 && (
        <button
          onClick={() => setShow((v) => !v)}
          className="md:hidden w-full rounded-2xl bg-white py-3.5 text-sm font-semibold text-[#4E5968] transition hover:bg-[#E5E8EB]"
        >
          {show ? "지도 닫기" : "지도로 보기"}
        </button>
      )}
    </div>
  );
}
