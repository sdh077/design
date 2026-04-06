"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounce } from "@/lib/use-debounce";
import type { Place } from "@/types/place";

export function PlaceList({ places }: { places: Place[] }) {
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const onDelete = async (id: string) => {
        if (!confirm("정말 삭제할까요?")) return;

        setLoadingId(id);

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
            setLoadingId(null);
        }
    };

    const onPatch = async (
        id: string,
        payload: Partial<
            Pick<Place, "is_recommended" | "sort_order" | "description" | "naver_map_link">
        >
    ) => {
        try {
            await fetch(`/api/places/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
        } catch (err) {
            console.error(err);
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
                            <p className="mb-2 text-xs text-zinc-400">
                                저장 #{places.length - index}
                            </p>

                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                {p.place_name?.trim() ? p.place_name : "네이버 지도"}
                            </h3>

                            <div className="mt-3 space-y-3">
                                <DescriptionEditor
                                    value={p.description ?? ""}
                                    placeId={p.id}
                                    onSave={onPatch}
                                />
                                <NaverLinkEditor
                                    value={p.naver_map_link ?? ""}
                                    placeId={p.id}
                                    onSave={onPatch}
                                />
                            </div>
                        </div>

                        <div className="flex w-full flex-col gap-3 md:w-[220px]">
                            <label className="flex items-center justify-between rounded-2xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800">
                                <span>공개 추천 포함</span>
                                <input
                                    type="checkbox"
                                    checked={p.is_recommended}
                                    disabled={loadingId === p.id}
                                    onChange={(e) =>
                                        onPatch(p.id, {
                                            is_recommended: e.target.checked,
                                        })
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

function DescriptionEditor({
    value,
    placeId,
    onSave,
}: {
    value: string;
    placeId: string;
    onSave: (
        id: string,
        payload: Partial<Pick<Place, "description" | "naver_map_link">>
    ) => Promise<void>;
}) {
    const [text, setText] = useState(value ?? "");
    const [saving, setSaving] = useState(false);

    const debounced = useDebounce(text, 500);

    useEffect(() => {
        if (debounced === value) return;

        const run = async () => {
            setSaving(true);
            await onSave(placeId, {
                description: debounced,
            });
            setSaving(false);
        };

        run();
    }, [debounced]);

    return (
        <div className="space-y-1">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="추천 이유를 입력하세요"
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />

            <p className="text-xs text-zinc-400">
                {saving ? "저장 중..." : "자동 저장됨"}
            </p>
        </div>
    );
}

function NaverLinkEditor({
    value,
    placeId,
    onSave,
}: {
    value: string;
    placeId: string;
    onSave: (
        id: string,
        payload: Partial<Pick<Place, "naver_map_link">>
    ) => Promise<void>;
}) {
    const [text, setText] = useState(value ?? "");
    const [saving, setSaving] = useState(false);

    const debounced = useDebounce(text, 800);

    useEffect(() => {
        if (debounced === value) return;

        const run = async () => {
            setSaving(true);
            await onSave(placeId, { naver_map_link: debounced });
            setSaving(false);
        };

        run();
    }, [debounced]);

    return (
        <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                네이버 지도 링크
            </label>
            <div className="flex gap-2">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="https://naver.me/..."
                    className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                />
                {text && (
                    <a
                        href={text}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                        열기
                    </a>
                )}
            </div>
            <p className="text-xs text-zinc-400">
                {saving ? "저장 중..." : "자동 저장됨"}
            </p>
        </div>
    );
}