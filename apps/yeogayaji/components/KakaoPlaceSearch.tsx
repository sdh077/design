"use client";

import { useState } from "react";

export type KakaoPlace = {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  place_url: string;
  category_name: string;
  x: string; // lng
  y: string; // lat
};

type Props = {
  onSelect: (place: KakaoPlace) => void;
  onClose: () => void;
};

export function KakaoPlaceSearch({ onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<KakaoPlace[]>([]);
  const [searching, setSearching] = useState(false);

  const onSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed || searching) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/kakao/search?query=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      setResults(data.documents ?? []);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder="장소 검색 (예: 성수동 카페)"
          className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-[#191F28] outline-none placeholder:text-[#B0B8C1]"
        />
        <button
          onClick={onSearch}
          disabled={searching}
          className="rounded-xl bg-[#191F28] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {searching ? "…" : "검색"}
        </button>
        <button
          onClick={onClose}
          className="rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-500"
        >
          취소
        </button>
      </div>

      {results.length > 0 && (
        <div className="max-h-52 overflow-y-auto rounded-xl border border-zinc-200 bg-white">
          {results.map((place) => (
            <button
              key={place.id}
              onClick={() => onSelect(place)}
              className="w-full border-b border-zinc-100 px-3 py-2.5 text-left last:border-0 hover:bg-[#F2F4F6]"
            >
              <p className="text-sm font-semibold text-[#191F28]">{place.place_name}</p>
              <p className="text-xs text-[#6B7684]">
                {place.category_name.split(" > ").pop()} · {place.road_address_name || place.address_name}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
