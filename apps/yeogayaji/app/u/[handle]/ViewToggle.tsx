"use client";

import type { PlaceTab, PublicPlace } from "./types";
import PlaceTabs from "./PlaceTabs";
import { PlaceCard } from "./PlaceCard";

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
  onSelectPlace?: (id: string) => void;
};

export default function ViewToggle({ tabs, places, courses, viewerTabs, profileHandle, onSelectPlace }: Props) {
  return (
    <div className="space-y-4">
      {tabs.length > 0 ? (
        <PlaceTabs tabs={tabs} places={places} viewerTabs={viewerTabs} onSelectPlace={onSelectPlace} />
      ) : (
        <div className="space-y-3">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} viewerTabs={viewerTabs} onSelect={onSelectPlace} />
          ))}
        </div>
      )}

    </div>
  );
}
