"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@workspace/ui";

export function SyncButtons({ storeId }: { storeId: string }) {
    const router = useRouter();
    const [loadingType, setLoadingType] = useState<"catalog" | "orders" | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    async function handleSync(type: "catalog" | "orders") {
        try {
            setLoadingType(type);
            setMessage(null);

            const res = await fetch(`/api/toss/${type}/sync`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ storeId }),
            });

            const json = await res.json();

            if (!res.ok || !json.ok) {
                throw new Error(json.message ?? "동기화 실패");
            }

            setMessage(
                type === "catalog"
                    ? `카탈로그 ${json.count ?? 0}건 동기화 완료`
                    : `주문 ${json.count ?? 0}건 동기화 완료`
            );

            router.refresh();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "동기화 실패");
        } finally {
            setLoadingType(null);
        }
    }

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSync("catalog")}
                    disabled={loadingType !== null}
                >
                    {loadingType === "catalog" ? "동기화 중..." : "카탈로그 동기화"}
                </Button>

                <Button
                    type="button"
                    onClick={() => handleSync("orders")}
                    disabled={loadingType !== null}
                >
                    {loadingType === "orders" ? "동기화 중..." : "주문 동기화"}
                </Button>
            </div>

            {message ? (
                <div className="text-sm text-muted-foreground">{message}</div>
            ) : null}
        </div>
    );
}