"use client";

import { useState } from "react";
import { Button, Input } from "@workspace/ui";

type StoreOption = {
    id: string;
    name: string;
};

export function CreateInventoryItemForm({
    stores,
}: {
    stores: StoreOption[];
}) {
    const [storeId, setStoreId] = useState(stores[0]?.id ?? "");
    const [name, setName] = useState("");
    const [baseUnit, setBaseUnit] = useState("");
    const [safetyStock, setSafetyStock] = useState("0");
    const [loading, setLoading] = useState(false);

    const onSubmit = async () => {
        try {
            setLoading(true);

            const res = await fetch("/api/inventory-items", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    storeId,
                    name,
                    baseUnit,
                    safetyStock: Number(safetyStock || 0),
                }),
            });

            const json = await res.json();

            if (!res.ok || !json.ok) {
                throw new Error(json.message ?? "재고 품목 생성 실패");
            }

            window.location.reload();
        } catch (error) {
            alert(error instanceof Error ? error.message : "재고 품목 생성 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-3">
            <select
                className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-600"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
            >
                {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                        {store.name}
                    </option>
                ))}
            </select>

            <Input
                placeholder="품목명 (예: 우유, 원두, 치즈)"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <Input
                placeholder="기준 단위 (예: ml, g, ea)"
                value={baseUnit}
                onChange={(e) => setBaseUnit(e.target.value)}
            />

            <Input
                placeholder="안전재고"
                type="number"
                value={safetyStock}
                onChange={(e) => setSafetyStock(e.target.value)}
            />

            <Button
                onClick={onSubmit}
                disabled={loading || !storeId || !name || !baseUnit}
            >
                {loading ? "생성 중..." : "재고 품목 생성"}
            </Button>
        </div>
    );
}