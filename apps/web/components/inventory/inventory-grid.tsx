"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input } from "@workspace/ui";

export type InventoryGridRow = {
    id: string;
    store_id: string;
    name: string;
    base_unit: string;
    safety_stock: number | string;
    is_active: boolean;
    current_stock: number | string;
    isNew?: boolean;
    tempId?: string;
};

type BulkSaveResponse = {
    ok: boolean;
    message?: string;
};

function toNumber(value: unknown) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function makeTempId() {
    return `temp-${Math.random().toString(36).slice(2, 10)}`;
}

function getRowKey(row: InventoryGridRow) {
    return row.id || row.tempId || "";
}

export function InventoryGrid({
    storeId,
    storeName,
    initialRows,
}: {
    storeId: string;
    storeName: string;
    initialRows: InventoryGridRow[];
}) {
    const [rows, setRows] = useState<InventoryGridRow[]>(initialRows);
    const [saving, setSaving] = useState(false);
    const [note, setNote] = useState("실사 반영");
    const [dirtyMap, setDirtyMap] = useState<Record<string, true>>({});
    const [deactivatedMap, setDeactivatedMap] = useState<Record<string, true>>({});
    const [newItemName, setNewItemName] = useState("");

    useEffect(() => {
        setRows(initialRows);
        setDirtyMap({});
        setDeactivatedMap({});
    }, [initialRows]);

    const dirtyCount = useMemo(() => Object.keys(dirtyMap).length, [dirtyMap]);
    const deactivatedCount = useMemo(
        () => Object.keys(deactivatedMap).length,
        [deactivatedMap]
    );

    const markDirty = (rowKey: string) => {
        setDirtyMap((prev) => ({
            ...prev,
            [rowKey]: true,
        }));
    };

    const updateCell = (
        rowKeyValue: string,
        field: keyof InventoryGridRow,
        value: string | boolean
    ) => {
        setRows((prev) =>
            prev.map((row) => {
                if (getRowKey(row) !== rowKeyValue) return row;
                return {
                    ...row,
                    [field]: value,
                };
            })
        );

        markDirty(rowKeyValue);
    };

    const addRow = () => {
        const name = newItemName.trim();
        if (!name) {
            alert("품목명을 입력해주세요.");
            return;
        }

        const tempId = makeTempId();

        setRows((prev) => [
            {
                id: "",
                tempId,
                store_id: storeId,
                name,
                base_unit: "",
                safety_stock: 0,
                is_active: true,
                current_stock: 0,
                isNew: true,
            },
            ...prev,
        ]);

        setDirtyMap((prev) => ({
            ...prev,
            [tempId]: true,
        }));

        setNewItemName("");
    };

    const toggleDeactivate = (rowKeyValue: string) => {
        setDeactivatedMap((prev) => {
            const next = { ...prev };
            if (next[rowKeyValue]) {
                delete next[rowKeyValue];
            } else {
                next[rowKeyValue] = true;
            }
            return next;
        });
    };

    const handleSave = async () => {
        try {
            const creates = rows
                .filter(
                    (row) =>
                        row.isNew &&
                        dirtyMap[getRowKey(row)] &&
                        !deactivatedMap[getRowKey(row)]
                )
                .map((row) => ({
                    name: String(row.name).trim(),
                    base_unit: String(row.base_unit).trim(),
                    safety_stock: toNumber(row.safety_stock),
                    current_stock: toNumber(row.current_stock),
                    is_active: Boolean(row.is_active),
                }));

            const updates = rows
                .filter(
                    (row) =>
                        !row.isNew &&
                        dirtyMap[getRowKey(row)] &&
                        !deactivatedMap[getRowKey(row)]
                )
                .map((row) => ({
                    id: row.id,
                    name: String(row.name).trim(),
                    base_unit: String(row.base_unit).trim(),
                    safety_stock: toNumber(row.safety_stock),
                    current_stock: toNumber(row.current_stock),
                    is_active: Boolean(row.is_active),
                }));

            const deactivates = rows
                .filter((row) => !row.isNew && deactivatedMap[getRowKey(row)])
                .map((row) => ({
                    id: row.id,
                }));

            for (const row of [...creates, ...updates]) {
                if (!row.name) throw new Error("품목명은 비워둘 수 없습니다.");
                if (!row.base_unit) throw new Error("단위는 필수입니다.");
                if (row.safety_stock < 0) throw new Error("안전재고는 0 이상이어야 합니다.");
                if (row.current_stock < 0) throw new Error("현재고는 0 이상이어야 합니다.");
            }

            setSaving(true);

            // ✅ 여기서 실제 API 호출
            const res = await fetch("/api/inventory/bulk-save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    storeId,
                    note,
                    creates,
                    updates,
                    deactivates,
                }),
            });

            const json = (await res.json()) as BulkSaveResponse;

            if (!res.ok || !json.ok) {
                throw new Error(json.message ?? "저장 실패");
            }

            alert("저장되었습니다.");
            window.location.reload();
        } catch (error) {
            alert(error instanceof Error ? error.message : "저장 실패");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <p className="font-medium">{storeName}</p>
                <p className="text-sm text-muted-foreground">
                    변경 {dirtyCount}건 · 비활성 예정 {deactivatedCount}건
                </p>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_auto] rounded-xl border p-4">
                <Input
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="새 재고 품목명"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addRow();
                        }
                    }}
                />
                <Button type="button" variant="outline" onClick={addRow}>
                    행 추가
                </Button>
            </div>

            <div className="max-w-sm">
                <label className="mb-2 block text-sm font-medium">저장 메모</label>
                <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="예: 실사 반영"
                />
            </div>

            <div className="overflow-x-auto rounded-xl border">
                <table className="min-w-full border-collapse text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="border-b px-3 py-2 text-left">품목명</th>
                            <th className="border-b px-3 py-2 text-left">단위</th>
                            <th className="border-b px-3 py-2 text-left">안전재고</th>
                            <th className="border-b px-3 py-2 text-left">현재고</th>
                            <th className="border-b px-3 py-2 text-left">상태</th>
                            <th className="border-b px-3 py-2 text-left">비활성</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                                    재고 품목이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            rows.map((row) => {
                                const rowKey = getRowKey(row);
                                const isMarkedDeactivated = Boolean(deactivatedMap[rowKey]);

                                return (
                                    <tr
                                        key={rowKey}
                                        className={isMarkedDeactivated ? "bg-red-50/60 opacity-60" : ""}
                                    >
                                        <td className="border-b px-3 py-2">
                                            <Input
                                                value={String(row.name)}
                                                onChange={(e) => updateCell(rowKey, "name", e.target.value)}
                                                placeholder="품목명"
                                            />
                                        </td>

                                        <td className="border-b px-3 py-2">
                                            <Input
                                                value={String(row.base_unit)}
                                                onChange={(e) => updateCell(rowKey, "base_unit", e.target.value)}
                                                placeholder="kg / ml / ea"
                                            />
                                        </td>

                                        <td className="border-b px-3 py-2">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={String(row.safety_stock)}
                                                onChange={(e) =>
                                                    updateCell(rowKey, "safety_stock", e.target.value)
                                                }
                                            />
                                        </td>

                                        <td className="border-b px-3 py-2">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={String(row.current_stock)}
                                                onChange={(e) =>
                                                    updateCell(rowKey, "current_stock", e.target.value)
                                                }
                                            />
                                        </td>

                                        <td className="border-b px-3 py-2">
                                            <label className="inline-flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(row.is_active)}
                                                    onChange={(e) =>
                                                        updateCell(rowKey, "is_active", e.target.checked)
                                                    }
                                                />
                                                <span>{row.is_active ? "사용" : "중지"}</span>
                                            </label>
                                        </td>

                                        <td className="border-b px-3 py-2">
                                            {!row.isNew ? (
                                                <Button
                                                    type="button"
                                                    variant={isMarkedDeactivated ? "default" : "outline"}
                                                    onClick={() => toggleDeactivate(rowKey)}
                                                >
                                                    {isMarkedDeactivated ? "취소" : "비활성"}
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setRows((prev) => prev.filter((r) => getRowKey(r) !== rowKey));
                                                        setDirtyMap((prev) => {
                                                            const next = { ...prev };
                                                            delete next[rowKey];
                                                            return next;
                                                        });
                                                    }}
                                                >
                                                    제거
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div>
                <Button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || (dirtyCount === 0 && deactivatedCount === 0)}
                >
                    {saving ? "저장 중..." : "저장"}
                </Button>
            </div>
        </div>
    );
}