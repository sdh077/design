"use client";

import { useState } from "react";
import { Button } from "@workspace/ui";

export function SyncButtons({ storeId }: { storeId: string }) {
    const [loading, setLoading] = useState<"catalog" | "orders" | null>(null);

    const syncCatalog = async () => {
        try {
            setLoading("catalog");

            const res = await fetch("/api/toss/catalog/sync", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ storeId }),
            });

            const json = await res.json();

            if (!res.ok || !json.ok) {
                throw new Error(json.message ?? "카탈로그 동기화 실패");
            }

            alert(`카탈로그 ${json.syncedCount}건 동기화 완료`);
        } catch (error) {
            alert(error instanceof Error ? error.message : "카탈로그 동기화 실패");
        } finally {
            setLoading(null);
        }
    };

    const syncOrders = async () => {
        try {
            setLoading("orders");

            const res = await fetch("/api/toss/orders/sync", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ storeId, days: 2 }),
            });

            const json = await res.json();

            if (!res.ok || !json.ok) {
                throw new Error(json.message ?? "주문 동기화 실패");
            }

            alert(`주문 ${json.syncedCount}건 동기화 완료`);
        } catch (error) {
            alert(error instanceof Error ? error.message : "주문 동기화 실패");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="flex gap-2">
            <Button onClick={syncCatalog} disabled={loading !== null}>
                {loading === "catalog" ? "동기화 중..." : "카탈로그 Sync"}
            </Button>
            <Button variant="outline" onClick={syncOrders} disabled={loading !== null}>
                {loading === "orders" ? "동기화 중..." : "주문 Sync"}
            </Button>
        </div>
    );
}