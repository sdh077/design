"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeNaverMeLink } from "@/lib/naver";
import type { PlaceTab } from "@/types/place-tab";

export function PlaceForm({
  tabs,
  selectedTabId,
}: {
  tabs: PlaceTab[];
  selectedTabId: string;
}) {
  const router = useRouter();

  const [placeName, setPlaceName] = useState("");
  const [naverMapLink, setNaverMapLink] = useState("");
  const [tabId, setTabId] = useState(selectedTabId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTabId(selectedTabId);
  }, [selectedTabId]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError(null);

    const normalized = normalizeNaverMeLink(naverMapLink);
    if (!normalized) {
      setError("네이버 지도 링크를 입력해 주세요.");
      return;
    }

    if (!tabId) {
      setError("저장할 탭을 선택해 주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/places", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          place_name: placeName.trim() || null,
          naver_map_link: normalized,
          tab_id: tabId,
        }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(payload?.message ?? "저장 실패");
      }

      setPlaceName("");
      setNaverMapLink("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1">
        <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
          이름 (선택)
        </label>
        <input
          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
          placeholder="예: 카페, 음식점 이름"
          value={placeName}
          onChange={(e) => setPlaceName(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
          저장할 탭
        </label>
        <select
          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
          value={tabId}
          onChange={(e) => setTabId(e.target.value)}
          disabled={loading}
        >
          {tabs.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
          네이버 지도 링크
        </label>
        <input
          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
          placeholder="예: https://naver.me/5Kb3kUc8"
          value={naverMapLink}
          onChange={(e) => setNaverMapLink(e.target.value)}
          disabled={loading}
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading || !naverMapLink.trim()}
        className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {loading ? "저장 중..." : "저장"}
      </button>
    </form>
  );
}

