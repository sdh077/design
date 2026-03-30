"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Place } from "@/types/place";

export function PlaceList({ places }: { places: Place[] }) {
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const onDelete = async (id: string) => {
        if (!confirm("정말 삭제할까요?")) return;
        setLoadingId(id);

        try {
            const res = await fetch(`/api/places/${id}`, { method: "DELETE" });
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
            setLoadingId(null);
        }
    };

    const onPatch = async (
        id: string,
        payload: Partial<Pick<Place, "is_recommended" | "sort_order">>
    ) => {
        setLoadingId(id);

        try {
            const res = await fetch(`/api/places/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const body = (await res.json().catch(() => null)) as
                    | { message?: string }
                    | null;
                throw new Error(body?.message ?? "수정 실패");
            }

            router.refresh();
        } catch (err) {
            alert(err instanceof Error ? err.message : "수정 실패");
        } finally {
            setLoadingId(null);
        }
    };

    if (!places.length) {
        return (
            <div className="rounded-3xl border border-dashed border-zinc-200 p-8 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                저장된 네이버 지도 링크가 없습니다. 위 입력창에 링크를 저장해보세요.
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {places.map((p, index) => (
                <article
                    key={p.id}
                    className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
                >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 flex-1">
                            <p className="mb-2 text-xs text-zinc-400">저장 #{places.length - index}</p>
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                {p.place_name?.trim() ? p.place_name : "네이버 지도"}
                            </h3>

                            {p.description ? (
                                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                                    {p.description}
                                </p>
                            ) : null}

                            <a
                                href={p.naver_map_link}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 inline-flex text-sm text-blue-600 underline underline-offset-4 dark:text-blue-400"
                            >
                                {p.naver_map_link}
                            </a>
                        </div>

                        <div className="flex w-full flex-col gap-3 md:w-[220px]">
                            <label className="flex items-center justify-between rounded-2xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800">
                                <span>공개 추천 포함</span>
                                <input
                                    type="checkbox"
                                    checked={p.is_recommended}
                                    disabled={loadingId === p.id}
                                    onChange={(e) =>
                                        onPatch(p.id, { is_recommended: e.target.checked })
                                    }
                                />
                            </label>

                            <label className="rounded-2xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800">
                                <span className="mb-2 block">정렬 순서</span>
                                <input
                                    type="number"
                                    defaultValue={p.sort_order ?? 0}
                                    disabled={loadingId === p.id}
                                    onBlur={(e) =>
                                        onPatch(p.id, {
                                            sort_order: Number(e.target.value || 0),
                                        })
                                    }
                                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                                />
                            </label>

                            <button
                                onClick={() => onDelete(p.id)}
                                disabled={loadingId === p.id}
                                className="inline-flex items-center justify-center rounded-2xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/30"
                            >
                                {loadingId === p.id ? "처리 중..." : "삭제"}
                            </button>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}