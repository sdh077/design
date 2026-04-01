"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { parseNaverShareInput } from "@/lib/naver";
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
  const [description, setDescription] = useState("");
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

    const parsed = parseNaverShareInput(naverMapLink);
    if (!parsed.normalizedLink) {
      setError("네이버 지도 링크 또는 공유 텍스트를 입력해 주세요.");
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
          place_name: placeName.trim() || parsed.placeName || null,
          description: description.trim() || null,
          naver_map_link: parsed.normalizedLink,
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
      setDescription("");
      setNaverMapLink("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="grid gap-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">이름 (선택)</span>
          <input
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            disabled={loading}
            className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium">한줄 추천 이유 (선택)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            disabled={loading}
            className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium">저장할 탭</span>
          <select
            value={tabId}
            onChange={(e) => setTabId(e.target.value)}
            disabled={loading}
            className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            {tabs.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium">
            네이버 지도 링크 또는 공유 텍스트
          </span>
          <input
            value={naverMapLink}
            onChange={(e) => setNaverMapLink(e.target.value)}
            disabled={loading}
            placeholder="https://naver.me/... 또는 네이버지도 공유 문구 전체"
            className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
          />
        </label>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-fit rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-black"
        >
          {loading ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}
