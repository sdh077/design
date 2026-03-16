"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Input } from "@workspace/ui";

type Store = {
    id: string;
    name: string;
    code: string | null;
    timezone: string;
    address: string | null;
    phone: string | null;
    status: string | null;
};

export function StoreActions({ store }: { store: Store }) {
    const router = useRouter();

    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState(store.name);
    const [code, setCode] = useState(store.code ?? "");
    const [timezone, setTimezone] = useState(store.timezone);
    const [address, setAddress] = useState(store.address ?? "");
    const [phone, setPhone] = useState(store.phone ?? "");
    const [status, setStatus] = useState(store.status ?? "ACTIVE");
    const [loading, setLoading] = useState(false);

    async function onUpdate() {
        try {
            setLoading(true);

            const res = await fetch(`/api/stores/${store.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    code,
                    timezone,
                    address,
                    phone,
                    status,
                }),
            });

            const json = await res.json();

            if (!res.ok || !json.ok) {
                throw new Error(json.message ?? "매장 수정 실패");
            }

            setIsOpen(false);
            router.refresh();
        } catch (error) {
            alert(error instanceof Error ? error.message : "매장 수정 실패");
        } finally {
            setLoading(false);
        }
    }

    async function onDelete() {
        const ok = window.confirm("정말 이 매장을 삭제할까요?");
        if (!ok) return;

        try {
            setLoading(true);

            const res = await fetch(`/api/stores/${store.id}`, {
                method: "DELETE",
            });

            const json = await res.json();

            if (!res.ok || !json.ok) {
                throw new Error(json.message ?? "매장 삭제 실패");
            }

            router.refresh();
        } catch (error) {
            alert(error instanceof Error ? error.message : "매장 삭제 실패");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(true)}>
                    수정
                </Button>
                <Button type="button" variant="outline" onClick={onDelete} disabled={loading}>
                    삭제
                </Button>
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-6">
                    <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-foreground">매장 수정</h2>
                        </div>

                        <div className="space-y-4">
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="매장명" />
                            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="매장 코드" />
                            <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="타임존" />
                            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="주소" />
                            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="연락처" />

                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                            >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="PENDING">PENDING</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                    취소
                                </Button>
                                <Button type="button" onClick={onUpdate} disabled={loading || !name || !timezone}>
                                    {loading ? "저장 중..." : "저장"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}