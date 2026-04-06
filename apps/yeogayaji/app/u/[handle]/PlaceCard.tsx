import type { PublicPlace } from "./types";

export function PlaceCard({ place }: { place: PublicPlace }) {
    return (
        <div className="rounded-2xl bg-white p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate font-semibold text-[#191F28]">
                        {place.place_name?.trim() || "장소"}
                    </p>
                    {place.description && (
                        <p className="mt-1 text-sm leading-relaxed text-[#6B7684] whitespace-pre-line">
                            {place.description}
                        </p>
                    )}
                </div>
                <div className="flex shrink-0 flex-col gap-1.5">
                    {place.kakao_map_link && (
                        <a
                            href={place.kakao_map_link}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full bg-[#FEE500] px-4 py-2 text-center text-xs font-semibold text-[#191F28] transition hover:brightness-95"
                        >
                            카카오맵
                        </a>
                    )}
                    {place.naver_map_link && (
                        <a
                            href={place.naver_map_link}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full bg-[#03C75A] px-4 py-2 text-center text-xs font-semibold text-white transition hover:brightness-95"
                        >
                            네이버 지도
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
