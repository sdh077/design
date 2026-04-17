"use client";

import { useState } from "react";
import { REGIONS, type Region, type Zone } from "./regionData";

type Props = {
  selectedRegionId: string | null;
  selectedZoneId: string | null;
  onChange: (regionId: string | null, zoneId: string | null) => void;
};

export default function RegionFilter({ selectedRegionId, selectedZoneId, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [pendingRegion, setPendingRegion] = useState<Region | null>(null);

  const selectedRegion = REGIONS.find((r) => r.id === selectedRegionId);
  const selectedZone = selectedRegion?.zones?.find((z) => z.id === selectedZoneId);

  const label = selectedZone
    ? `${selectedRegion!.name} · ${selectedZone.name.split("\n")[0]}`
    : selectedRegion
    ? selectedRegion.name
    : "지역 필터";

  const handleRegionClick = (region: Region) => {
    if (region.zones) {
      setPendingRegion(region);
    } else {
      onChange(region.id, null);
      setOpen(false);
    }
  };

  const handleZoneClick = (zone: Zone) => {
    onChange(pendingRegion!.id, zone.id);
    setPendingRegion(null);
    setOpen(false);
  };

  const handleReset = () => {
    onChange(null, null);
    setPendingRegion(null);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => { setOpen(true); setPendingRegion(null); }}
        className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
          selectedRegionId
            ? "bg-[#191F28] text-white"
            : "bg-white text-[#6B7684] hover:bg-[#E5E8EB]"
        }`}
      >
        <span>📍</span>
        <span>{label}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" onClick={() => { setOpen(false); setPendingRegion(null); }}>
          <div
            className="w-full max-w-sm rounded-t-3xl md:rounded-3xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {pendingRegion ? (
              <>
                <div className="mb-4 flex items-center gap-2">
                  <button onClick={() => setPendingRegion(null)} className="text-[#6B7684] hover:text-[#191F28]">
                    ←
                  </button>
                  <p className="font-bold text-[#191F28]">서울 권역 선택</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {pendingRegion.zones!.map((zone) => (
                    <button
                      key={zone.id}
                      onClick={() => handleZoneClick(zone)}
                      className={`rounded-2xl px-3 py-3 text-xs font-semibold text-left leading-snug transition whitespace-pre-line ${
                        selectedZoneId === zone.id
                          ? "bg-[#191F28] text-white"
                          : "bg-[#F2F4F6] text-[#191F28] hover:bg-[#E5E8EB]"
                      }`}
                    >
                      {zone.name}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="mb-4 font-bold text-[#191F28]">지역 선택</p>
                <div className="grid grid-cols-4 gap-2">
                  {REGIONS.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => handleRegionClick(region)}
                      className={`rounded-2xl py-3 text-sm font-semibold transition ${
                        selectedRegionId === region.id
                          ? "bg-[#191F28] text-white"
                          : "bg-[#F2F4F6] text-[#191F28] hover:bg-[#E5E8EB]"
                      }`}
                    >
                      {region.name}
                    </button>
                  ))}
                </div>
                {selectedRegionId && (
                  <button onClick={handleReset} className="mt-4 w-full rounded-2xl border border-zinc-200 py-2.5 text-sm text-[#6B7684] hover:bg-[#F2F4F6] transition">
                    필터 초기화
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
