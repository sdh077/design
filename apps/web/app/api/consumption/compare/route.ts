import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type ConsumptionRow = {
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

        const supabase = await createClient();
        const admin = createAdminClient();

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { ok: false, message: "로그인이 필요합니다." },
                { status: 401 }
            );
        }

        const { data: merchantAccount, error: accountError } = await admin
            .from("merchant_accounts")
            .select("merchant_id")
            .eq("auth_user_id", user.id)
            .maybeSingle();

        if (accountError || !merchantAccount?.merchant_id) {
            return NextResponse.json(
                { ok: false, message: "가맹점 계정 정보가 없습니다." },
                { status: 403 }
            );
        }

        const { data: store, error: storeError } = await admin
            .from("stores")
            .select("id, merchant_id")
            .eq("id", storeId)
            .maybeSingle();

        if (storeError || !store) {
            return NextResponse.json(
                { ok: false, message: "매장을 찾을 수 없습니다." },
                { status: 404 }
            );
        }

        if (store.merchant_id !== merchantAccount.merchant_id) {
            return NextResponse.json(
                { ok: false, message: "해당 매장에 접근할 수 없습니다." },
                { status: 403 }
            );
        }

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
            { data: inventoryTxns, error: inventoryTxnsError },
        ] = await Promise.all([
            admin
                .from("external_catalog_items")
                .select("id, external_item_id, store_id")
                .eq("store_id", storeId),

            admin
                .from("menu_external_item_maps")
                .select("id, menu_id, external_catalog_item_id"),

            admin
                .from("recipes")
                .select("id, menu_id, is_active, store_id")
                .eq("store_id", storeId)
                .eq("is_active", true),

            admin
                .from("recipe_lines")
                .select("id, recipe_id, inventory_item_id, quantity, unit"),

            admin
                .from("inventory_items")
                .select("id, name, base_unit, store_id")
                .eq("store_id", storeId),

            admin
                .from("external_orders")
                .select("id, store_id, ordered_at, order_state")
                .eq("store_id", storeId)
                .gte("ordered_at", from.toISOString())
                .lte("ordered_at", to.toISOString())
                .in("order_state", ["COMPLETED", "CLOSED", "DONE"]),

            admin
                .from("external_order_items")
                .select("id, external_order_row_id, external_item_id, title, quantity"),

            admin
                .from("inventory_txns")
                .select("id, inventory_item_id, type, quantity, unit, note, occurred_at")
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
            Array<{ inventoryItemId: string; quantity: number; unit: string }>
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
            { id: string; name: string; baseUnit: string }
        >();

        for (const item of safeInventoryItems) {
            inventoryItemById.set(String(item.id), {
                id: String(item.id),
                name: String(item.name),
                baseUnit: String(item.base_unit),
            });
        }

        const expectedTotals = new Map<
            string,
            {
                inventoryItemId: string;
                inventoryItemName: string;
                baseUnit: string;
                expectedQuantity: number;
            }
        >();

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
                const current = expectedTotals.get(line.inventoryItemId);

                if (!current) {
                    expectedTotals.set(line.inventoryItemId, {
                        inventoryItemId: line.inventoryItemId,
                        inventoryItemName: inventoryItem.name,
                        baseUnit: inventoryItem.baseUnit,
                        expectedQuantity: consumed,
                    });
                    continue;
                }

                current.expectedQuantity += consumed;
            }
        }

        const actualMap = new Map<
            string,
            { actual: number; waste: number; adjustment: number }
        >();

        for (const txn of safeInventoryTxns) {
            const key = String(txn.inventory_item_id);
            const current = actualMap.get(key) ?? {
                actual: 0,
                waste: 0,
                adjustment: 0,
            };

            const qty = Math.abs(Number(txn.quantity ?? 0));
            const type = String(txn.type ?? "").toUpperCase();
            const note = String(txn.note ?? "").toUpperCase();

            if (type === "OUT") {
                current.actual += qty;
            } else if (type === "WASTE") {
                current.waste += qty;
            } else if (type === "ADJUSTMENT") {
                current.adjustment += qty;
            } else if (note.includes("WASTE")) {
                current.waste += qty;
            } else if (note.includes("ADJUST")) {
                current.adjustment += qty;
            }

            actualMap.set(key, current);
        }

        const allInventoryItemIds = new Set([
            ...Array.from(expectedTotals.keys()),
            ...Array.from(actualMap.keys()),
        ]);

        const items: ConsumptionRow[] = Array.from(allInventoryItemIds).map((id) => {
            const expected = expectedTotals.get(id);
            const actual = actualMap.get(id);
            const inventoryItem = inventoryItemById.get(id);

            const expectedQuantity = Number(expected?.expectedQuantity ?? 0);
            const actualQuantity = Number(actual?.actual ?? 0);
            const wasteQuantity = Number(actual?.waste ?? 0);
            const adjustmentQuantity = Number(actual?.adjustment ?? 0);
            const difference = actualQuantity - expectedQuantity;
            const varianceRate =
                expectedQuantity > 0
                    ? Number(((difference / expectedQuantity) * 100).toFixed(2))
                    : null;

            return {
                inventoryItemId: id,
                inventoryItemName: inventoryItem?.name ?? expected?.inventoryItemName ?? "알 수 없음",
                baseUnit: inventoryItem?.baseUnit ?? expected?.baseUnit ?? "-",
                expectedQuantity,
                actualQuantity,
                wasteQuantity,
                adjustmentQuantity,
                difference,
                varianceRate,
            };
        });

        items.sort((a, b) => b.expectedQuantity - a.expectedQuantity);

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