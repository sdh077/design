"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input } from "@workspace/ui";
import { MenuMappingDialog } from "@/components/menus/menu-mapping-dialog";

type MenuRow = {
    id: string;
    store_id: string;
    name: string;
    is_active: boolean;
    updated_at: string;
    has_recipe: boolean;
    has_external_mapping: boolean;
    external_mapping: {
        external_catalog_item_id: string | null;
        external_title: string | null;
        external_item_id: string | null;
        external_code: string | null;
    } | null;
    isNew?: boolean;
    tempId?: string;
};

type StatusFilter = "all" | "active" | "inactive";
type LinkedFilter = "all" | "recipe" | "mapped" | "unlinked";
type SortKey = "name" | "updated_at";

type BulkSaveResponse = {
    ok: boolean;
    message?: string;
};

function makeTempId() {
    return `temp-${Math.random().toString(36).slice(2, 10)}`;
}

function getRowKey(row: MenuRow) {
    return row.id || row.tempId || "";
}

function Badge({
    children,
    tone = "default",
}: {
    children: React.ReactNode;
    tone?: "default" | "green" | "blue" | "gray";
}) {
    const className =
        tone === "green"
            ? "bg-green-100 text-green-700"
            : tone === "blue"
                ? "bg-blue-100 text-blue-700"
                : tone === "gray"
                    ? "bg-gray-100 text-gray-600"
                    : "bg-slate-100 text-slate-700";

    return (
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${className}`}>
            {children}
        </span>
    );
}

export function MenusEditor({
    storeId,
    storeName,
    initialRows,
    onRefresh,
}: {
    storeId: string;
    storeName: string;
    initialRows: MenuRow[];
    onRefresh: () => void;
}) {
    const [rows, setRows] = useState<MenuRow[]>(initialRows);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [linkedFilter, setLinkedFilter] = useState<LinkedFilter>("all");
    const [sortKey, setSortKey] = useState<SortKey>("name");
    const [sortAsc, setSortAsc] = useState(true);
    const [dirtyMap, setDirtyMap] = useState<Record<string, boolean>>({});
    const [deactivatedMap, setDeactivatedMap] = useState<Record<string, boolean>>({});
    const [newMenuName, setNewMenuName] = useState("");
    const [mappingTarget, setMappingTarget] = useState<MenuRow | null>(null);

    useEffect(() => {
        setRows(initialRows);
        setDirtyMap({});
        setDeactivatedMap({});
        setSearch("");
        setStatusFilter("all");
        setLinkedFilter("all");
    }, [initialRows]);

    const dirtyCount = useMemo(() => Object.keys(dirtyMap).length, [dirtyMap]);
    const deactivatedCount = useMemo(() => Object.keys(deactivatedMap).length, [deactivatedMap]);

    const summary = useMemo(() => {
        const total = rows.length;
        const active = rows.filter((row) => row.is_active).length;
        const withRecipe = rows.filter((row) => row.has_recipe).length;
        const withMapping = rows.filter((row) => row.has_external_mapping).length;
        return { total, active, withRecipe, withMapping };
    }, [rows]);

    const markDirty = (rowKey: string) => {
        setDirtyMap((prev) => ({ ...prev, [rowKey]: true }));
    };

    const updateRow = (rowKeyValue: string, patch: Partial<MenuRow>) => {
        setRows((prev) =>
            prev.map((row) => (getRowKey(row) === rowKeyValue ? { ...row, ...patch } : row))
        );
        markDirty(rowKeyValue);
    };

    const addRow = () => {
        const name = newMenuName.trim();
        if (!name) {
            alert("메뉴명을 입력해주세요.");
            return;
        }

        const tempId = makeTempId();

        setRows((prev) => [
            {
                id: "",
                tempId,
                store_id: storeId,
                name,
                is_active: true,
                updated_at: new Date().toISOString(),
                has_recipe: false,
                has_external_mapping: false,
                external_mapping: null,
                isNew: true,
            },
            ...prev,
        ]);

        setDirtyMap((prev) => ({ ...prev, [tempId]: true }));
        setNewMenuName("");
    };

    const toggleDeactivate = (rowKeyValue: string) => {
        setDeactivatedMap((prev) => {
            const next = { ...prev };
            if (next[rowKeyValue]) delete next[rowKeyValue];
            else next[rowKeyValue] = true;
            return next;
        });
    };

    const filteredRows = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        let next = [...rows];

        if (keyword) {
            next = next.filter((row) => row.name.toLowerCase().includes(keyword));
        }

        if (statusFilter === "active") next = next.filter((row) => row.is_active);
        else if (statusFilter === "inactive") next = next.filter((row) => !row.is_active);

        if (linkedFilter === "recipe") next = next.filter((row) => row.has_recipe);
        else if (linkedFilter === "mapped") next = next.filter((row) => row.has_external_mapping);
        else if (linkedFilter === "unlinked") {
            next = next.filter((row) => !row.has_recipe && !row.has_external_mapping);
        }

        next.sort((a, b) => {
            if (sortKey === "name") {
                const av = a.name.toLowerCase();
                const bv = b.name.toLowerCase();
                if (av < bv) return sortAsc ? -1 : 1;
                if (av > bv) return sortAsc ? 1 : -1;
                return 0;
            }
            const av = new Date(a.updated_at).getTime();
            const bv = new Date(b.updated_at).getTime();
            return sortAsc ? av - bv : bv - av;
        });

        return next;
    }, [rows, search, statusFilter, linkedFilter, sortKey, sortAsc]);

    const handleSave = async () => {
        try {
            const creates = rows
                .filter((row) => row.isNew && dirtyMap[getRowKey(row)] && !deactivatedMap[getRowKey(row)])
                .map((row) => ({
                    name: row.name.trim(),
                    is_active: row.is_active,
                }));

            const updates = rows
                .filter((row) => !row.isNew && dirtyMap[getRowKey(row)] && !deactivatedMap[getRowKey(row)])
                .map((row) => ({
                    id: row.id,
                    name: row.name.trim(),
                    is_active: row.is_active,
                }));

            const deactivates = rows
                .filter((row) => !row.isNew && deactivatedMap[getRowKey(row)])
                .map((row) => ({ id: row.id }));

            for (const row of [...creates, ...updates]) {
                if (!row.name) {
                    throw new Error("메뉴명은 비워둘 수 없습니다.");
                }
            }

            setSaving(true);

            const res = await fetch("/api/menus/bulk-save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ storeId, creates, updates, deactivates }),
            });

            const json = (await res.json()) as BulkSaveResponse;

            if (!res.ok || !json.ok) {
                throw new Error(json.message ?? "저장에 실패했습니다.");
            }

            onRefresh();
        } catch (error) {
            alert(error instanceof Error ? error.message : "저장에 실패했습니다.");
        } finally {
            setSaving(false);
        }
    };

    const hasUnsavedChanges = dirtyCount > 0 || deactivatedCount > 0;

    return (
        <>
            <div className="space-y-4">
                {/* 상단/필터 영역은 기존과 거의 동일 */}

                <div className="overflow-hidden rounded-xl border bg-card">
                    {filteredRows.length === 0 ? (
                        <div className="p-6 text-sm text-muted-foreground">표시할 메뉴가 없습니다.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr className="border-b">
                                        <th className="px-4 py-3 text-left font-medium">메뉴명</th>
                                        <th className="px-4 py-3 text-left font-medium">연결 상태</th>
                                        <th className="px-4 py-3 text-left font-medium">연동</th>
                                        <th className="px-4 py-3 text-left font-medium">상태</th>
                                        <th className="px-4 py-3 text-left font-medium">수정일</th>
                                        <th className="px-4 py-3 text-left font-medium">비활성</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRows.map((row) => {
                                        const rowKey = getRowKey(row);
                                        const isDirty = Boolean(dirtyMap[rowKey]);
                                        const isMarkedDeactivated = Boolean(deactivatedMap[rowKey]);

                                        return (
                                            <tr
                                                key={rowKey}
                                                className={`border-b align-top ${isMarkedDeactivated ? "bg-red-50/60 opacity-70" : ""
                                                    }`}
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="space-y-2">
                                                        <Input
                                                            value={row.name}
                                                            onChange={(e) =>
                                                                updateRow(rowKey, {
                                                                    name: e.target.value,
                                                                    updated_at: new Date().toISOString(),
                                                                })
                                                            }
                                                            placeholder="메뉴명"
                                                        />
                                                        <div className="flex gap-2">
                                                            {row.isNew ? <Badge tone="blue">신규</Badge> : null}
                                                            {isDirty ? <Badge>수정됨</Badge> : null}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <div className="space-y-2">
                                                        <div className="flex flex-wrap gap-2">
                                                            {row.has_recipe ? (
                                                                <Badge tone="blue">레시피 있음</Badge>
                                                            ) : (
                                                                <Badge tone="gray">레시피 없음</Badge>
                                                            )}

                                                            {row.has_external_mapping ? (
                                                                <Badge tone="green">POS 연동됨</Badge>
                                                            ) : (
                                                                <Badge tone="gray">POS 미연동</Badge>
                                                            )}
                                                        </div>

                                                        {row.external_mapping?.external_title ? (
                                                            <div className="text-xs text-muted-foreground">
                                                                연결된 POS 메뉴: {row.external_mapping.external_title}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3">
                                                    {!row.isNew ? (
                                                        <div className="flex gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setMappingTarget(row)}
                                                            >
                                                                {row.has_external_mapping ? "연동 변경" : "연동"}
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            저장 후 연동 가능
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3">
                                                    <label className="inline-flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={row.is_active}
                                                            onChange={(e) =>
                                                                updateRow(rowKey, {
                                                                    is_active: e.target.checked,
                                                                    updated_at: new Date().toISOString(),
                                                                })
                                                            }
                                                        />
                                                        <span>{row.is_active ? "사용" : "중지"}</span>
                                                    </label>
                                                </td>

                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {row.updated_at
                                                        ? new Date(row.updated_at).toLocaleString("ko-KR")
                                                        : "-"}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {!row.isNew ? (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => toggleDeactivate(rowKey)}
                                                        >
                                                            {isMarkedDeactivated ? "취소" : "비활성"}
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
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
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <MenuMappingDialog
                open={Boolean(mappingTarget)}
                onClose={() => setMappingTarget(null)}
                storeId={storeId}
                menuId={mappingTarget?.id ?? ""}
                menuName={mappingTarget?.name ?? ""}
                currentMappingTitle={mappingTarget?.external_mapping?.external_title ?? null}
                onMapped={onRefresh}
            />
        </>
    );
}