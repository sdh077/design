"use client";

import { useState } from "react";
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
};

export default function ViewToggle({ tabs, places, courses, viewerTabs, profileHandle }: Props) {
  const [view, setView] = useState<"places" | "courses">("places");

  return (
    <div className="space-y-4">
      {/* 뷰 전환 탭 */}
      <div className="flex gap-2">
        <button
          onClick={() => setView("places")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            view === "places" ? "bg-[#191F28] text-white" : "bg-white text-[#6B7684] hover:bg-[#E5E8EB]"
          }`}
        >
          장소
        </button>
        <button
          onClick={() => setView("courses")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            view === "courses" ? "bg-[#191F28] text-white" : "bg-white text-[#6B7684] hover:bg-[#E5E8EB]"
          }`}
        >
          코스
        </button>
      </div>

      {view === "places" ? (
        tabs.length > 0 ? (
          <PlaceTabs tabs={tabs} places={places} viewerTabs={viewerTabs} />
        ) : (
          <div className="space-y-3">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} viewerTabs={viewerTabs} />
            ))}
          </div>
        )
      ) : (
        <div className="space-y-3">
          {courses.length === 0 ? (
            <div className="rounded-2xl bg-white px-6 py-12 text-center">
              <p className="text-sm text-[#B0B8C1]">아직 코스가 없습니다.</p>
            </div>
          ) : (
            courses.map((course) => (
              <a
                key={course.id}
                href={`/u/${profileHandle}/courses/${course.id}`}
                className="flex items-center justify-between rounded-2xl bg-white p-5 transition hover:bg-[#F8F9FA]"
              >
                <div>
                  <p className="font-semibold text-[#191F28]">{course.name}</p>
                  <p className="mt-0.5 text-xs text-[#6B7684]">{course.days_count}일 코스</p>
                </div>
                <span className="text-[#B0B8C1]">→</span>
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}
