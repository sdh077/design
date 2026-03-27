"use client";

import { useEffect, useState } from "react";
import { InventoryGrid, type InventoryGridRow } from "@/components/inventory/inventory-grid";

type StoreOption = {
    id: string;
    name: string;
};

type InventoryResponse = {
    ok: boolean;
    rows?: InventoryGridRow[];
    message?: string;
};

export function InventoryClient({ stores }: { stores: StoreOption[] }) {
    const [storeId, setStoreId] = useState(stores[0]?.id ?? "");
    const [rows, setRows] = useState<InventoryGridRow[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const run = async () => {
            if (!storeId) return;

            try {
                setLoading(true);

                const res = await fetch(`/api/inventory/list?storeId=${storeId}`);
                const json = (await res.json()) as InventoryResponse;

                if (!res.ok || !json.ok) {
                    throw new Error(json.message ?? "재고 조회 실패");
                }

                setRows(json.rows ?? []);
            } catch (error) {
                alert(error instanceof Error ? error.message : "재고 조회 실패");
            } finally {
                setLoading(false);
            }
        };

        run();
    }, [storeId]);

    if (stores.length === 0) {
        return (
            <div className="rounded-xl border p-6 text-sm text-muted-foreground">
                먼저 매장을 생성해야 재고를 관리할 수 있습니다.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="max-w-xs space-y-2">
                <label className="text-sm font-medium">지점 선택</label>
                <select
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                    {stores.map((store) => (
                        <option key={store.id} value={store.id}>
                            {store.name}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="rounded-xl border p-6 text-sm text-muted-foreground">
                    불러오는 중...
                </div>
            ) : (
                <InventoryGrid
                    storeId={storeId}
                    storeName={stores.find((s) => s.id === storeId)?.name ?? ""}
                    initialRows={rows}
                />
            )}
        </div>
    );
}