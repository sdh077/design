"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Place } from "@/types/place";

export function PlaceList({ places }: { places: Place[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const onDelete = async (id: string) => {
    if (!confirm("정말 삭제할까요?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/places/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(payload?.message ?? "삭제 실패");
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제 실패");
    } finally {
      setDeletingId(null);
    }
  };

  if (!places.length) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
        저장된 네이버 지도 링크가 없습니다. 위 입력창에 링크를 저장해보세요.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {places.map((p) => (
        <div
          key={p.id}
          className="flex items-start justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="min-w-0">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {p.place_name?.trim() ? p.place_name : "네이버 지도"}
            </div>
            <a
              href={p.naver_map_link}
              target="_blank"
              rel="noreferrer"
              className="block break-all text-xs text-blue-700 underline underline-offset-4 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
            >
              {p.naver_map_link}
            </a>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => onDelete(p.id)}
              disabled={deletingId === p.id}
              className="inline-flex items-center justify-center rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/30"
            >
              {deletingId === p.id ? "삭제 중..." : "삭제"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

