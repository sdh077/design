"use client";

import { useEffect, useRef, useState } from "react";

type MapItem = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

declare global {
  interface Window { kakao: any; }
}

export function CourseMap({ items }: { items: MapItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const init = () => {
      if (!containerRef.current) return;
      if (!mapRef.current) {
        mapRef.current = new window.kakao.maps.Map(containerRef.current, {
          center: new window.kakao.maps.LatLng(items[0].lat, items[0].lng),
          level: 6,
        });
      }

      const map = mapRef.current;
      const bounds = new window.kakao.maps.LatLngBounds();
      const positions = items.map((item, idx) => {
        const pos = new window.kakao.maps.LatLng(item.lat, item.lng);

        // 번호 마커
        const marker = new window.kakao.maps.Marker({
          position: pos,
          map,
          title: item.name,
        });

        const iw = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:5px 9px;font-size:12px;font-weight:600;white-space:nowrap;color:#191F28;background:#fff;border-radius:6px">${idx + 1}. ${item.name}</div>`,
        });
        window.kakao.maps.event.addListener(marker, "click", () => iw.open(map, marker));
        bounds.extend(pos);
        return pos;
      });

      // 경로선
      if (positions.length > 1) {
        new window.kakao.maps.Polyline({
          map,
          path: positions,
          strokeWeight: 3,
          strokeColor: "#191F28",
          strokeOpacity: 0.6,
          strokeStyle: "solid",
        });
      }

      if (items.length > 1) map.setBounds(bounds);
      setReady(true);
    };

    if (window.kakao?.maps) { init(); return; }

    const jsKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
    if (!jsKey) return;

    const existing = document.querySelector(`script[src*="dapi.kakao.com"]`);
    if (existing) {
      existing.addEventListener("load", () => window.kakao.maps.load(() => init()));
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${jsKey}&autoload=false`;
    script.onload = () => window.kakao.maps.load(() => init());
    document.head.appendChild(script);
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div className="relative h-56 overflow-hidden rounded-2xl border border-zinc-200 md:h-72">
      <div ref={containerRef} className="absolute inset-0" />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F2F4F6] text-sm text-[#B0B8C1]">
          지도 로딩 중…
        </div>
      )}
    </div>
  );
}
