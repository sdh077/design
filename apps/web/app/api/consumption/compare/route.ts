import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type CompareRow = {
    inventoryItemId: string;
    inventoryItemName: string;
    baseUnit: string;
    expectedQuantity: number;
    actualQuantity: number;
    wasteQuantity: number;
    adjustmentQuantity: number;
    difference: number;
    varianceRate: number | null;
};

export async function GET(req: NextRequest) {
    try {
        const storeId = String(req.nextUrl.searchParams.get("storeId") ?? "");
        const days = Number(req.nextUrl.searchParams.get("days") ?? 7);

        if (!storeId) {
            return NextResponse.json(
                { ok: false, message: "storeId is required" },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - days);

        const [
            { data: externalCatalogItems, error: externalCatalogItemsError },
            { data: menuMappings, error: menuMappingsError },
            { data: recipes, error: recipesError },
            { data: recipeLines, error: recipeLinesError },
            { data: inventoryItems, error: inventoryItemsError },
            { data: externalOrders, error: externalOrdersError },
            { data: externalOrderItems, error: externalOrderItemsError },
            { data: inventoryTxns, error: inventoryTxnsError },
        ] = await Promise.all([
            supabase
                .from("external_catalog_items")
                .select("id, external_item_id, store_id")
                .eq("store_id", storeId),

            supabase
                .from("menu_external_item_maps")
                .select("id, menu_id, external_catalog_item_id"),

            supabase
                .from("recipes")
                .select("id, menu_id, is_active")
                .eq("is_active", true),

            supabase
                .from("recipe_lines")
                .select("id, recipe_id, inventory_item_id, quantity, unit"),

            supabase
                .from("inventory_items")
                .select("id, name, base_unit, store_id")
                .eq("store_id", storeId),

            supabase
                .from("external_orders")
                .select("id, store_id, ordered_at, order_state")
                .eq("store_id", storeId)
                .gte("ordered_at", from.toISOString())
                .lte("ordered_at", to.toISOString())
                .in("order_state", ["COMPLETED", "CLOSED", "DONE"]),

            supabase
                .from("external_order_items")
                .select("id, external_order_row_id, external_item_id, title, quantity"),

            supabase
                .from("inventory_txns")
                .select("id, inventory_item_id, type, quantity, occurred_at")
                .eq("store_id", storeId)
                .gte("occurred_at", from.toISOString())
                .lte("occurred_at", to.toISOString()),
        ]);

        if (externalCatalogItemsError) throw new Error(externalCatalogItemsError.message);
        if (menuMappingsError) throw new Error(menuMappingsError.message);
        if (recipesError) throw new Error(recipesError.message);
        if (recipeLinesError) throw new Error(recipeLinesError.message);
        if (inventoryItemsError) throw new Error(inventoryItemsError.message);
        if (externalOrdersError) throw new Error(externalOrdersError.message);
        if (externalOrderItemsError) throw new Error(externalOrderItemsError.message);
        if (inventoryTxnsError) throw new Error(inventoryTxnsError.message);

        const safeExternalCatalogItems = externalCatalogItems ?? [];
        const safeMenuMappings = menuMappings ?? [];
        const safeRecipes = recipes ?? [];
        const safeRecipeLines = recipeLines ?? [];
        const safeInventoryItems = inventoryItems ?? [];
        const safeExternalOrders = externalOrders ?? [];
        const safeExternalOrderItems = externalOrderItems ?? [];
        const safeInventoryTxns = inventoryTxns ?? [];

        const validOrderIds = new Set(safeExternalOrders.map((order) => String(order.id)));

        const externalCatalogRowIdByExternalItemId = new Map<string, string>();
        for (const item of safeExternalCatalogItems) {
            externalCatalogRowIdByExternalItemId.set(
                String(item.external_item_id),
                String(item.id)
            );
        }

        const menuIdByExternalCatalogRowId = new Map<string, string>();
        for (const mapping of safeMenuMappings) {
            menuIdByExternalCatalogRowId.set(
                String(mapping.external_catalog_item_id),
                String(mapping.menu_id)
            );
        }

        const activeRecipeIdByMenuId = new Map<string, string>();
        for (const recipe of safeRecipes) {
            if (!recipe.is_active) continue;
            if (!activeRecipeIdByMenuId.has(String(recipe.menu_id))) {
                activeRecipeIdByMenuId.set(String(recipe.menu_id), String(recipe.id));
            }
        }

        const recipeLinesByRecipeId = new Map<
            string,
            Array<{ inventoryItemId: string; quantity: number }>
        >();

        for (const line of safeRecipeLines) {
            const recipeId = String(line.recipe_id);
            const current = recipeLinesByRecipeId.get(recipeId) ?? [];
            current.push({
                inventoryItemId: String(line.inventory_item_id),
                quantity: Number(line.quantity),
            });
            recipeLinesByRecipeId.set(recipeId, current);
        }

        const inventoryItemById = new Map<
            string,
            { id: string; name: string; baseUnit: string }
        >();

        for (const item of safeInventoryItems) {
            inventoryItemById.set(String(item.id), {
                id: String(item.id),
                name: String(item.name),
                baseUnit: String(item.base_unit),
            });
        }

        const expectedMap = new Map<string, number>();

        for (const orderItem of safeExternalOrderItems) {
            if (!validOrderIds.has(String(orderItem.external_order_row_id))) continue;
            if (!orderItem.external_item_id) continue;

            const externalCatalogRowId = externalCatalogRowIdByExternalItemId.get(
                String(orderItem.external_item_id)
            );
            if (!externalCatalogRowId) continue;

            const menuId = menuIdByExternalCatalogRowId.get(externalCatalogRowId);
            if (!menuId) continue;

            const recipeId = activeRecipeIdByMenuId.get(menuId);
            if (!recipeId) continue;

            const lines = recipeLinesByRecipeId.get(recipeId) ?? [];
            const orderQty = Number(orderItem.quantity);

            for (const line of lines) {
                const current = expectedMap.get(line.inventoryItemId) ?? 0;
                expectedMap.set(line.inventoryItemId, current + orderQty * line.quantity);
            }
        }

        const actualOutMap = new Map<string, number>();
        const wasteMap = new Map<string, number>();
        const adjustmentMap = new Map<string, number>();

        for (const txn of safeInventoryTxns) {
            const itemId = String(txn.inventory_item_id);
            const qty = Number(txn.quantity);
            const type = String(txn.type);

            if (type === "OUT") {
                actualOutMap.set(itemId, (actualOutMap.get(itemId) ?? 0) + qty);
            } else if (type === "WASTE") {
                wasteMap.set(itemId, (wasteMap.get(itemId) ?? 0) + qty);
            } else if (type === "ADJUST" || type === "COUNT") {
                adjustmentMap.set(itemId, (adjustmentMap.get(itemId) ?? 0) + qty);
            }
        }

        const allInventoryIds = new Set<string>([
            ...expectedMap.keys(),
            ...actualOutMap.keys(),
            ...wasteMap.keys(),
            ...adjustmentMap.keys(),
        ]);

        const items: CompareRow[] = Array.from(allInventoryIds).flatMap((itemId) => {
            const inventoryItem = inventoryItemById.get(itemId);
            if (!inventoryItem) return [];

            const expectedQuantity = expectedMap.get(itemId) ?? 0;
            const actualOutQuantity = actualOutMap.get(itemId) ?? 0;
            const wasteQuantity = wasteMap.get(itemId) ?? 0;
            const actualQuantity = actualOutQuantity + wasteQuantity;
            const adjustmentQuantity = adjustmentMap.get(itemId) ?? 0;
            const difference = actualQuantity - expectedQuantity;
            const varianceRate =
                expectedQuantity > 0 ? Number(((difference / expectedQuantity) * 100).toFixed(2)) : null;

            return [
                {
                    inventoryItemId: itemId,
                    inventoryItemName: inventoryItem.name,
                    baseUnit: inventoryItem.baseUnit,
                    expectedQuantity,
                    actualQuantity,
                    wasteQuantity,
                    adjustmentQuantity,
                    difference,
                    varianceRate,
                },
            ];
        });

        items.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));

        return NextResponse.json({
            ok: true,
            range: {
                from: from.toISOString(),
                to: to.toISOString(),
                days,
            },
            items,
        });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : "unknown error",
            },
            { status: 500 }
        );
    }
}