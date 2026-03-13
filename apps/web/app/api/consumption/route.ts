import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type ConsumptionRow = {
    inventoryItemId: string;
    inventoryItemName: string;
    baseUnit: string;
    totalQuantity: number;
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
        from.setDate(to.getDate() - days);

        const [
            { data: externalCatalogItems, error: externalCatalogItemsError },
            { data: menuMappings, error: menuMappingsError },
            { data: recipes, error: recipesError },
            { data: recipeLines, error: recipeLinesError },
            { data: inventoryItems, error: inventoryItemsError },
            { data: externalOrders, error: externalOrdersError },
            { data: externalOrderItems, error: externalOrderItemsError },
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
        ]);

        if (externalCatalogItemsError) throw new Error(externalCatalogItemsError.message);
        if (menuMappingsError) throw new Error(menuMappingsError.message);
        if (recipesError) throw new Error(recipesError.message);
        if (recipeLinesError) throw new Error(recipeLinesError.message);
        if (inventoryItemsError) throw new Error(inventoryItemsError.message);
        if (externalOrdersError) throw new Error(externalOrdersError.message);
        if (externalOrderItemsError) throw new Error(externalOrderItemsError.message);

        const safeExternalCatalogItems = externalCatalogItems ?? [];
        const safeMenuMappings = menuMappings ?? [];
        const safeRecipes = recipes ?? [];
        const safeRecipeLines = recipeLines ?? [];
        const safeInventoryItems = inventoryItems ?? [];
        const safeExternalOrders = externalOrders ?? [];
        const safeExternalOrderItems = externalOrderItems ?? [];

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
            Array<{
                inventoryItemId: string;
                quantity: number;
                unit: string;
            }>
        >();

        for (const line of safeRecipeLines) {
            const recipeId = String(line.recipe_id);
            const current = recipeLinesByRecipeId.get(recipeId) ?? [];
            current.push({
                inventoryItemId: String(line.inventory_item_id),
                quantity: Number(line.quantity),
                unit: String(line.unit),
            });
            recipeLinesByRecipeId.set(recipeId, current);
        }

        const inventoryItemById = new Map<
            string,
            {
                id: string;
                name: string;
                baseUnit: string;
            }
        >();

        for (const item of safeInventoryItems) {
            inventoryItemById.set(String(item.id), {
                id: String(item.id),
                name: String(item.name),
                baseUnit: String(item.base_unit),
            });
        }

        const totals = new Map<string, ConsumptionRow>();

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
                const inventoryItem = inventoryItemById.get(line.inventoryItemId);
                if (!inventoryItem) continue;

                const consumed = orderQty * line.quantity;
                const current = totals.get(line.inventoryItemId);

                if (!current) {
                    totals.set(line.inventoryItemId, {
                        inventoryItemId: line.inventoryItemId,
                        inventoryItemName: inventoryItem.name,
                        baseUnit: inventoryItem.baseUnit,
                        totalQuantity: consumed,
                    });
                    continue;
                }

                current.totalQuantity += consumed;
            }
        }

        const items = Array.from(totals.values()).sort(
            (a, b) => b.totalQuantity - a.totalQuantity
        );

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