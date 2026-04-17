"use client";

import { useState, useMemo } from "react";
import PlaceMap from "./PlaceMap";
import ViewToggle from "./ViewToggle";
import RegionFilter from "./RegionFilter";
import { REGIONS, inBounds } from "./regionData";
import type { PublicPlace, PlaceTab } from "./types";

type Course = {
  id: string;
  name: string;
  days_count: number;
  created_at: string;
};

type Props = {
  tabs: PlaceTab[];
  places: PublicPlace[];
  courses: Course[];
  viewerTabs?: PlaceTab[];
  profileHandle: string;
  mappablePlaces: (PublicPlace & { lat: number; lng: number })[];
};

export default function UserPageClient({ tabs, places, courses, viewerTabs, profileHandle, mappablePlaces }: Props) {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [regionId, setRegionId] = useState<string | null>(null);
  const [zoneId, setZoneId] = useState<string | null>(null);

  const filteredPlaces = useMemo(() => {
    if (!regionId) return places;
    const region = REGIONS.find((r) => r.id === regionId);
    if (!region) return places;
    const bounds = zoneId ? region.zones?.find((z) => z.id === zoneId)?.bounds ?? region.bounds : region.bounds;
    return places.filter((p) => p.lat != null && p.lng != null && inBounds(p.lat!, p.lng!, bounds));
  }, [places, regionId, zoneId]);

  const filteredMappable = useMemo(() => {
    if (!regionId) return mappablePlaces;
    return mappablePlaces.filter((p) => filteredPlaces.some((fp) => fp.id === p.id));
  }, [mappablePlaces, filteredPlaces, regionId]);

  // 필터 적용 시 탭도 필터된 장소 기준으로 유효한 것만
  const filteredTabs = useMemo(() => {
    if (!regionId) return tabs;
    const tabIds = new Set(filteredPlaces.map((p) => p.tab_id));
    return tabs.filter((t) => tabIds.has(t.id));
  }, [tabs, filteredPlaces, regionId]);

  return (
    <div className="flex flex-col md:flex-row md:items-start gap-4">
      {mappablePlaces.length > 0 && (
        <div className="md:order-2 md:w-[420px] md:sticky md:top-4" style={{ display: filteredMappable.length > 0 ? undefined : "none" }}>
          <PlaceMap places={filteredMappable} selectedPlaceId={selectedPlaceId} />
        </div>
      )}
      <div className="md:order-1 md:flex-1 space-y-4">
        <div className="flex items-center gap-2">
          <RegionFilter
            selectedRegionId={regionId}
            selectedZoneId={zoneId}
            onChange={(r, z) => { setRegionId(r); setZoneId(z); setSelectedPlaceId(null); }}
          />
          {regionId && (
            <span className="text-xs text-[#6B7684]">{filteredPlaces.length}개 장소</span>
          )}
        </div>
        <ViewToggle
          tabs={filteredTabs}
          places={filteredPlaces}
          courses={courses}
          viewerTabs={viewerTabs}
          profileHandle={profileHandle}
          onSelectPlace={setSelectedPlaceId}
        />
      </div>
    </div>
  );
}
