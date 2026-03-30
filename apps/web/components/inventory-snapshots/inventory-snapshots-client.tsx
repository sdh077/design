"use client";

import { useEffect, useState } from "react";
import { Button, Input } from "@workspace/ui";

type StoreRow = {
    id: string;
    name: string;
};

type InventoryItemRow = {
    id: string;
    name: string;
    base_unit: string;
    current_quantity: number;
};

type SnapshotEditRow = {
    inventory_item_id: string;
    name: string;
    unit: string;
    quantity: string;
};

function nowLocalDatetimeValue() {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = now.getFullYear();
    const mm = pad(now.getMonth() + 1);
    const dd = pad(now.getDate());
    const hh = pad(now.getHours());
    const min = pad(now.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export function InventorySnapshotsClient({ stores }: { stores: StoreRow[] }) {
    const [storeId, setStoreId] = useState(stores[0]?.id ?? "");
    const [snapshotAt, setSnapshotAt] = useState(nowLocalDatetimeValue());
    const [rows, setRows] = useState<SnapshotEditRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const loadInventoryItems = async () => {
        if (!storeId) return;

        try {
            setLoading(true);

            const res = await fetch(`/api/inventory/items?storeId=${storeId}`);
            const json = await res.json();

            if (!res.ok || !json.ok) {
                throw new Error(json.message ?? "재고 항목 조회 실패");
            }

            const mapped = ((json.rows ?? []) as InventoryItemRow[]).map((item) => ({
                inventory_item_id: item.id,
                name: item.name,
                unit: item.base_unit,
                quantity: String(item.current_quantity ?? 0),
            }));

            setRows(mapped);
        } catch (error) {
            alert(error instanceof Error ? error.message : "재고 항목 조회 실패");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInventoryItems();
    }, [storeId]);

    const handleChangeQuantity = (inventoryItemId: string, value: string) => {
        setRows((prev) =>
            prev.map((row) =>
                row.inventory_item_id === inventoryItemId
                    ? { ...row, quantity: value }
                    : row
            )
        );
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const body = {
                storeId,
                snapshotAt: new Date(snapshotAt).toISOString(),
                rows: rows.map((row) => ({
                    inventory_item_id: row.inventory_item_id,
                    quantity: Number(row.quantity || 0),
                    unit: row.unit,
                })),
            };

            const res = await fetch("/api/inventory-snapshots", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const json = await res.json();

            if (!res.ok || !json.ok) {
                throw new Error(json.message ?? "스냅샷 저장 실패");
            }

            alert("스냅샷이 저장되었습니다.");
            setSnapshotAt(nowLocalDatetimeValue());
            await loadInventoryItems();
        } catch (error) {
            alert(error instanceof Error ? error.message : "스냅샷 저장 실패");
        } finally {
            setSaving(false);
        }
    };

    if (stores.length === 0) {
        return (
            <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
                먼저 매장을 생성해야 합니다.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-xl border bg-card p-4">
                <div className="grid gap-3 md:grid-cols-[220px_220px_auto]">
                    <select
                        value={storeId}
                        onChange={(e) => setStoreId(e.target.value)}
                        className="h-10 rounded-md border bg-background px-3 text-sm"
                    >
                        {stores.map((store) => (
                            <option key={store.id} value={store.id}>
                                {store.name}
                            </option>
                        ))}
                    </select>

                    <Input
                        type="datetime-local"
                        value={snapshotAt}
                        onChange={(e) => setSnapshotAt(e.target.value)}
                    />

                    <Button onClick={handleSave} disabled={saving || loading}>
                        {saving ? "저장 중..." : "스냅샷 저장"}
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border bg-card">
                <div className="border-b p-4 font-semibold">재고 스냅샷 입력</div>

                {loading ? (
                    <div className="p-6 text-sm text-muted-foreground">불러오는 중...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr className="border-b">
                                    <th className="px-4 py-3 text-left">재고명</th>
                                    <th className="px-4 py-3 text-left">단위</th>
                                    <th className="px-4 py-3 text-left">현재 재고 기준 수량</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr key={row.inventory_item_id} className="border-b">
                                        <td className="px-4 py-3">{row.name}</td>
                                        <td className="px-4 py-3">{row.unit}</td>
                                        <td className="px-4 py-3">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={row.quantity}
                                                onChange={(e) =>
                                                    handleChangeQuantity(row.inventory_item_id, e.target.value)
                                                }
                                                placeholder="0"
                                            />
                                        </td>
                                    </tr>
                                ))}
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                                            재고 항목이 없습니다.
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}