"use client";

import { FormEvent, useMemo, useState } from "react";

type PublicProfileFormProps = {
    initialHandle: string;
    initialDisplayName: string;
    initialBio: string;
    initialIsPublic: boolean;
    publicUrlBase: string;
};

export function PublicProfileForm({
    initialHandle,
    initialDisplayName,
    initialBio,
    initialIsPublic,
    publicUrlBase,
}: PublicProfileFormProps) {
    const [handle, setHandle] = useState(initialHandle);
    const [displayName, setDisplayName] = useState(initialDisplayName);
    const [bio, setBio] = useState(initialBio);
    const [isPublic, setIsPublic] = useState(initialIsPublic);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const previewUrl = useMemo(() => {
        const trimmed = handle.trim();
        if (!trimmed) return null;
        return `${publicUrlBase}/u/${trimmed}`;
    }, [handle, publicUrlBase]);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch("/api/profile/public", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    handle,
                    display_name: displayName,
                    bio,
                    is_public: isPublic,
                }),
            });

            const payload = (await res.json().catch(() => null)) as
                | { message?: string }
                | null;

            if (!res.ok) {
                throw new Error(payload?.message ?? "저장에 실패했습니다.");
            }

            setMessage("공개 프로필이 저장되었습니다.");
        } catch (err) {
            setMessage(err instanceof Error ? err.message : "저장에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-5">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    공개 추천 페이지 설정
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    로그인 없이 볼 수 있는 공개 추천 리스트 주소를 설정합니다.
                </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
                <label className="block">
                    <span className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        공개 아이디
                    </span>
                    <input
                        value={handle}
                        onChange={(e) => setHandle(e.target.value.toLowerCase())}
                        placeholder="예: sdh077"
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                        disabled={loading}
                    />
                </label>

                <label className="block">
                    <span className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        표시 이름
                    </span>
                    <input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="예: 대호의 서울 맛집"
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                        disabled={loading}
                    />
                </label>

                <label className="block">
                    <span className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        소개글
                    </span>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        placeholder="예: 네이버 지도에 저장해둔 곳 중 다시 가고 싶은 장소만 모아둔 리스트"
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                        disabled={loading}
                    />
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-800">
                    <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        disabled={loading}
                    />
                    <span className="text-sm text-zinc-800 dark:text-zinc-200">
                        공개 페이지 활성화
                    </span>
                </label>

                {previewUrl ? (
                    <div className="rounded-2xl bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-900">
                        <p className="text-zinc-500 dark:text-zinc-400">공개 주소</p>
                        <div className="mt-1 flex items-center justify-between gap-3">
                            <p className="break-all font-medium text-zinc-900 dark:text-zinc-100">
                                {previewUrl}
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard.writeText(previewUrl).then(() => {
                                        setMessage("주소를 복사했습니다.");
                                    });
                                }}
                                className="shrink-0 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                            >
                                복사
                            </button>
                        </div>
                    </div>
                ) : null}

                {message ? (
                    <p className="text-sm text-zinc-600 dark:text-zinc-300">{message}</p>
                ) : null}

                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                    {loading ? "저장 중..." : "저장"}
                </button>
            </form>
        </section>
    );
}