"use client";

import { useEffect, useState } from "react";
import { RecipesSimpleEditor } from "@/components/recipes/recipes-simple-editor";

type StoreOption = {
    id: string;
    name: string;
};

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

type RecipesListResponse = {
    ok: boolean;
    menus?: MenuRow[];
    inventoryItems?: InventoryItemRow[];
    recipes?: RecipeRow[];
    recipeLines?: RecipeLineRow[];
    message?: string;
};

export function RecipesClient({ stores }: { stores: StoreOption[] }) {
    const [storeId, setStoreId] = useState(stores[0]?.id ?? "");
    const [loading, setLoading] = useState(false);
    const [menus, setMenus] = useState<MenuRow[]>([]);
    const [inventoryItems, setInventoryItems] = useState<InventoryItemRow[]>([]);
    const [recipes, setRecipes] = useState<RecipeRow[]>([]);
    const [recipeLines, setRecipeLines] = useState<RecipeLineRow[]>([]);

    useEffect(() => {
        const run = async () => {
            if (!storeId) return;

            try {
                setLoading(true);

                const res = await fetch(`/api/recipes/list?storeId=${storeId}`);
                console.log(res)
                const json = (await res.json()) as RecipesListResponse;

                if (!res.ok || !json.ok) {
                    throw new Error(json.message ?? "레시피 데이터 조회 실패");
                }

                setMenus(json.menus ?? []);
                setInventoryItems(json.inventoryItems ?? []);
                setRecipes(json.recipes ?? []);
                setRecipeLines(json.recipeLines ?? []);
            } catch (error) {
                alert(error instanceof Error ? error.message : "레시피 데이터 조회 실패");
            } finally {
                setLoading(false);
            }
        };

        run();
    }, [storeId]);

    if (stores.length === 0) {
        return (
            <div className="rounded-xl border p-6 text-sm text-muted-foreground">
                먼저 매장을 생성해야 레시피를 관리할 수 있습니다.
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
                <RecipesSimpleEditor
                    storeId={storeId}
                    menus={menus}
                    inventoryItems={inventoryItems}
                    recipes={recipes}
                    recipeLines={recipeLines}
                />
            )}
        </div>
    );
}