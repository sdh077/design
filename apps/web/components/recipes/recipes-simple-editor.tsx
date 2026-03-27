"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input } from "@workspace/ui";

type MenuRow = {
    id: string;
    name: string;
    is_active: boolean;
};

type InventoryItemRow = {
    id: string;
    name: string;
    base_unit: string;
    is_active: boolean;
};

type RecipeRow = {
    id: string;
    menu_id: string;
    name: string | null;
};

type RecipeLineRow = {
    id: string;
    recipe_id: string;
    inventory_item_id: string;
    quantity: number;
    unit: string;
};

type EditableLine = {
    id?: string;
    tempId: string;
    inventory_item_id: string;
    quantity: string;
    unit: string;
    search: string;
};

function makeId() {
    return Math.random().toString(36).slice(2, 10);
}

function normalizeQuantity(value: string) {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return "";
    return String(n);
}

export function RecipesSimpleEditor({
    storeId,
    menus,
    inventoryItems,
    recipes,
    recipeLines,
}: {
    storeId: string;
    menus: MenuRow[];
    inventoryItems: InventoryItemRow[];
    recipes: RecipeRow[];
    recipeLines: RecipeLineRow[];
}) {
    const [selectedMenuId, setSelectedMenuId] = useState(menus[0]?.id ?? "");
    const [recipeName, setRecipeName] = useState("");
    const [lines, setLines] = useState<EditableLine[]>([]);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [copySourceMenuId, setCopySourceMenuId] = useState("");
    const [showCopyPanel, setShowCopyPanel] = useState(false);

    const selectedMenu = useMemo(
        () => menus.find((menu) => menu.id === selectedMenuId),
        [menus, selectedMenuId]
    );

    const recipeByMenuId = useMemo(() => {
        return new Map(recipes.map((recipe) => [recipe.menu_id, recipe]));
    }, [recipes]);

    const inventoryMap = useMemo(() => {
        return new Map(inventoryItems.map((item) => [item.id, item]));
    }, [inventoryItems]);

    const recipeLinesByRecipeId = useMemo(() => {
        const map = new Map<string, RecipeLineRow[]>();
        for (const line of recipeLines) {
            const key = line.recipe_id;
            const prev = map.get(key) ?? [];
            prev.push(line);
            map.set(key, prev);
        }
        return map;
    }, [recipeLines]);

    useEffect(() => {
        if (!selectedMenuId) {
            setRecipeName("");
            setLines([]);
            setDirty(false);
            return;
        }

        const currentRecipe = recipeByMenuId.get(selectedMenuId);
        const currentLines = currentRecipe
            ? (recipeLinesByRecipeId.get(currentRecipe.id) ?? []).map((line) => {
                const item = inventoryMap.get(line.inventory_item_id);
                return {
                    id: line.id,
                    tempId: makeId(),
                    inventory_item_id: line.inventory_item_id,
                    quantity: String(line.quantity),
                    unit: line.unit,
                    search: item?.name ?? "",
                };
            })
            : [];

        setRecipeName(currentRecipe?.name ?? `${selectedMenu?.name ?? ""} 레시피`);
        setLines(currentLines);
        setDirty(false);
    }, [
        selectedMenuId,
        recipeByMenuId,
        recipeLinesByRecipeId,
        selectedMenu,
        inventoryMap,
    ]);

    useEffect(() => {
        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!dirty) return;
            e.preventDefault();
            e.returnValue = "";
        };

        window.addEventListener("beforeunload", onBeforeUnload);
        return () => window.removeEventListener("beforeunload", onBeforeUnload);
    }, [dirty]);

    const addLine = (preset?: Partial<EditableLine>) => {
        setLines((prev) => [
            ...prev,
            {
                tempId: makeId(),
                inventory_item_id: preset?.inventory_item_id ?? "",
                quantity: preset?.quantity ?? "",
                unit: preset?.unit ?? "",
                search: preset?.search ?? "",
            },
        ]);
        setDirty(true);
    };

    const removeLine = (tempId: string) => {
        setLines((prev) => prev.filter((line) => line.tempId !== tempId));
        setDirty(true);
    };

    const updateLine = (
        tempId: string,
        field: keyof EditableLine,
        value: string
    ) => {
        setLines((prev) =>
            prev.map((line) => {
                if (line.tempId !== tempId) return line;

                const next = {
                    ...line,
                    [field]: value,
                };

                if (field === "inventory_item_id") {
                    const item = inventoryMap.get(value);
                    next.search = item?.name ?? "";
                    if (item) {
                        next.unit = item.base_unit;
                    }
                }

                return next;
            })
        );
        setDirty(true);
    };

    const setQuickQuantity = (tempId: string, amount: string) => {
        setLines((prev) =>
            prev.map((line) =>
                line.tempId === tempId ? { ...line, quantity: amount } : line
            )
        );
        setDirty(true);
    };

    const filteredInventoryOptions = (search: string) => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return inventoryItems.slice(0, 20);

        return inventoryItems
            .filter((item) => item.name.toLowerCase().includes(keyword))
            .slice(0, 20);
    };

    const handleCopyFromMenu = () => {
        try {
            if (!copySourceMenuId) {
                throw new Error("복사할 메뉴를 선택해주세요.");
            }

            const sourceRecipe = recipeByMenuId.get(copySourceMenuId);
            if (!sourceRecipe) {
                throw new Error("선택한 메뉴에는 레시피가 없습니다.");
            }

            const sourceLines = recipeLinesByRecipeId.get(sourceRecipe.id) ?? [];
            if (sourceLines.length === 0) {
                throw new Error("선택한 메뉴에는 재료가 없습니다.");
            }

            const copied = sourceLines.map((line) => {
                const item = inventoryMap.get(line.inventory_item_id);
                return {
                    tempId: makeId(),
                    inventory_item_id: line.inventory_item_id,
                    quantity: String(line.quantity),
                    unit: line.unit,
                    search: item?.name ?? "",
                };
            });

            setLines(copied);
            setDirty(true);
            setShowCopyPanel(false);
        } catch (error) {
            alert(error instanceof Error ? error.message : "레시피 복사에 실패했습니다.");
        }
    };

    const handleSave = async () => {
        try {
            if (!selectedMenuId) {
                throw new Error("메뉴를 선택해주세요.");
            }

            if (!recipeName.trim()) {
                throw new Error("레시피명을 입력해주세요.");
            }

            const cleanedLines = lines
                .map((line) => ({
                    id: line.id,
                    inventory_item_id: line.inventory_item_id,
                    quantity: Number(line.quantity),
                    unit: line.unit.trim(),
                }))
                .filter((line) => line.inventory_item_id && line.quantity > 0 && line.unit);

            if (cleanedLines.length === 0) {
                throw new Error("재료를 한 개 이상 입력해주세요.");
            }

            setSaving(true);

            const res = await fetch("/api/recipes/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    storeId,
                    menuId: selectedMenuId,
                    recipeName: recipeName.trim(),
                    lines: cleanedLines,
                }),
            });

            const json = await res.json();

            if (!res.ok || !json.ok) {
                throw new Error(json.message ?? "저장에 실패했습니다.");
            }

            window.location.reload();
        } catch (error) {
            alert(error instanceof Error ? error.message : "저장에 실패했습니다.");
        } finally {
            setSaving(false);
        }
    };

    if (menus.length === 0) {
        return (
            <div className="rounded-xl border p-6 text-sm text-muted-foreground">
                먼저 메뉴를 등록해야 레시피를 만들 수 있습니다.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[220px_1fr_auto_auto]">
                <div className="space-y-2">
                    <label className="text-sm font-medium">메뉴</label>
                    <select
                        value={selectedMenuId}
                        onChange={(e) => setSelectedMenuId(e.target.value)}
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    >
                        {menus.map((menu) => (
                            <option key={menu.id} value={menu.id}>
                                {menu.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">레시피명</label>
                    <Input
                        value={recipeName}
                        onChange={(e) => {
                            setRecipeName(e.target.value);
                            setDirty(true);
                        }}
                        placeholder="예: 아메리카노 기본 레시피"
                    />
                </div>

                <div className="flex items-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCopyPanel((prev) => !prev)}
                    >
                        레시피 복사
                    </Button>
                </div>

                <div className="flex items-end">
                    <Button type="button" onClick={handleSave} disabled={saving}>
                        {saving ? "저장 중..." : "저장"}
                    </Button>
                </div>
            </div>

            {showCopyPanel ? (
                <div className="rounded-xl border bg-muted/20 p-4">
                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">복사할 메뉴</label>
                            <select
                                value={copySourceMenuId}
                                onChange={(e) => setCopySourceMenuId(e.target.value)}
                                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                            >
                                <option value="">메뉴 선택</option>
                                {menus
                                    .filter((menu) => menu.id !== selectedMenuId)
                                    .map((menu) => (
                                        <option key={menu.id} value={menu.id}>
                                            {menu.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="flex items-end">
                            <Button type="button" variant="outline" onClick={handleCopyFromMenu}>
                                현재 메뉴에 복사
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}

            <div className="overflow-x-auto rounded-xl border">
                <table className="min-w-full border-collapse text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="border-b px-3 py-2 text-left">재고 품목</th>
                            <th className="border-b px-3 py-2 text-left">수량</th>
                            <th className="border-b px-3 py-2 text-left">단위</th>
                            <th className="border-b px-3 py-2 text-left"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {lines.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                                    아직 재료가 없습니다. 아래 버튼으로 추가하세요.
                                </td>
                            </tr>
                        ) : (
                            lines.map((line) => {
                                const options = filteredInventoryOptions(line.search);

                                return (
                                    <tr key={line.tempId}>
                                        <td className="border-b px-3 py-2 align-top">
                                            <div className="space-y-2">
                                                <Input
                                                    value={line.search}
                                                    onChange={(e) => updateLine(line.tempId, "search", e.target.value)}
                                                    placeholder="재고 품목 검색"
                                                />

                                                <select
                                                    value={line.inventory_item_id}
                                                    onChange={(e) =>
                                                        updateLine(line.tempId, "inventory_item_id", e.target.value)
                                                    }
                                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                                >
                                                    <option value="">재고 품목 선택</option>
                                                    {options.map((item) => (
                                                        <option key={item.id} value={item.id}>
                                                            {item.name} ({item.base_unit})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>

                                        <td className="border-b px-3 py-2 align-top">
                                            <div className="space-y-2">
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={line.quantity}
                                                    onChange={(e) =>
                                                        updateLine(
                                                            line.tempId,
                                                            "quantity",
                                                            normalizeQuantity(e.target.value)
                                                        )
                                                    }
                                                    placeholder="0"
                                                />
                                                <div className="flex flex-wrap gap-1">
                                                    {["0.5", "1", "2"].map((quick) => (
                                                        <button
                                                            key={quick}
                                                            type="button"
                                                            onClick={() => setQuickQuantity(line.tempId, quick)}
                                                            className="rounded-md border px-2 py-1 text-xs"
                                                        >
                                                            {quick}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="border-b px-3 py-2 align-top">
                                            <Input
                                                value={line.unit}
                                                onChange={(e) => updateLine(line.tempId, "unit", e.target.value)}
                                                placeholder="g / ml / shot"
                                            />
                                        </td>

                                        <td className="border-b px-3 py-2 align-top">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => removeLine(line.tempId)}
                                            >
                                                삭제
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-start">
                <Button type="button" variant="outline" onClick={() => addLine()}>
                    재료 추가
                </Button>
            </div>

            {dirty ? (
                <p className="text-xs text-amber-600">저장되지 않은 변경사항이 있습니다.</p>
            ) : null}
        </div>
    );
}