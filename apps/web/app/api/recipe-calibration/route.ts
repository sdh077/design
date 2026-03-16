import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type CalibrationItem = {
  menuId: string;
  menuName: string;
  recipeId: string;
  inventoryItemId: string;
  inventoryItemName: string;
  unit: string;
  soldCount: number;
  currentQuantity: number;
  expectedTotalQuantity: number;
  allocatedActualQuantity: number;
  suggestedQuantity: number | null;
  differencePerMenu: number | null;
  varianceRate: number | null;
  confidence: "HIGH" | "MEDIUM" | "LOW";
};

export async function GET(req: NextRequest) {
  try {
    const storeId = String(req.nextUrl.searchParams.get("storeId") ?? "");
    const days = Number(req.nextUrl.searchParams.get("days") ?? 14);

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
      { data: menus, error: menusError },
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
        .from("menus")
        .select("id, store_id, name, is_active")
        .eq("store_id", storeId)
        .eq("is_active", true),

      supabase
        .from("external_catalog_items")
        .select("id, external_item_id, store_id")
        .eq("store_id", storeId),

      supabase
        .from("menu_external_item_maps")
        .select("id, menu_id, external_catalog_item_id"),

      supabase
        .from("recipes")
        .select("id, menu_id, is_active, version, name")
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

    if (menusError) throw new Error(menusError.message);
    if (externalCatalogItemsError) throw new Error(externalCatalogItemsError.message);
    if (menuMappingsError) throw new Error(menuMappingsError.message);
    if (recipesError) throw new Error(recipesError.message);
    if (recipeLinesError) throw new Error(recipeLinesError.message);
    if (inventoryItemsError) throw new Error(inventoryItemsError.message);
    if (externalOrdersError) throw new Error(externalOrdersError.message);
    if (externalOrderItemsError) throw new Error(externalOrderItemsError.message);
    if (inventoryTxnsError) throw new Error(inventoryTxnsError.message);

    const safeMenus = menus ?? [];
    const safeExternalCatalogItems = externalCatalogItems ?? [];
    const safeMenuMappings = menuMappings ?? [];
    const safeRecipes = recipes ?? [];
    const safeRecipeLines = recipeLines ?? [];
    const safeInventoryItems = inventoryItems ?? [];
    const safeExternalOrders = externalOrders ?? [];
    const safeExternalOrderItems = externalOrderItems ?? [];
    const safeInventoryTxns = inventoryTxns ?? [];

    const validOrderIds = new Set(safeExternalOrders.map((order) => String(order.id)));

    const menuById = new Map(
      safeMenus.map((menu) => [
        String(menu.id),
        {
          id: String(menu.id),
          name: String(menu.name),
        },
      ])
    );

    const inventoryById = new Map(
      safeInventoryItems.map((item) => [
        String(item.id),
        {
          id: String(item.id),
          name: String(item.name),
          baseUnit: String(item.base_unit),
        },
      ])
    );

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

    // 메뉴별 active recipe 1개 선택
    const activeRecipeIdByMenuId = new Map<string, string>();
    for (const recipe of safeRecipes) {
      const menuId = String(recipe.menu_id);
      if (!activeRecipeIdByMenuId.has(menuId)) {
        activeRecipeIdByMenuId.set(menuId, String(recipe.id));
      }
    }

    // recipeId -> lines
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

    // 메뉴 판매수량
    const soldCountByMenuId = new Map<string, number>();

    for (const orderItem of safeExternalOrderItems) {
      if (!validOrderIds.has(String(orderItem.external_order_row_id))) continue;
      if (!orderItem.external_item_id) continue;

      const externalCatalogRowId = externalCatalogRowIdByExternalItemId.get(
        String(orderItem.external_item_id)
      );
      if (!externalCatalogRowId) continue;

      const menuId = menuIdByExternalCatalogRowId.get(externalCatalogRowId);
      if (!menuId) continue;

      soldCountByMenuId.set(
        menuId,
        (soldCountByMenuId.get(menuId) ?? 0) + Number(orderItem.quantity)
      );
    }

    // 메뉴-품목별 예상 소모량
    const expectedByMenuAndInventory = new Map<string, number>();
    // 품목별 총 예상 소모량
    const expectedTotalByInventory = new Map<string, number>();
    // 품목을 사용하는 메뉴 수
    const menuSetByInventory = new Map<string, Set<string>>();

    for (const [menuId, soldCount] of soldCountByMenuId.entries()) {
      const recipeId = activeRecipeIdByMenuId.get(menuId);
      if (!recipeId) continue;

      const lines = recipeLinesByRecipeId.get(recipeId) ?? [];
      for (const line of lines) {
        const key = `${menuId}:${line.inventoryItemId}`;
        const expected = soldCount * line.quantity;

        expectedByMenuAndInventory.set(
          key,
          (expectedByMenuAndInventory.get(key) ?? 0) + expected
        );

        expectedTotalByInventory.set(
          line.inventoryItemId,
          (expectedTotalByInventory.get(line.inventoryItemId) ?? 0) + expected
        );

        const currentMenus = menuSetByInventory.get(line.inventoryItemId) ?? new Set<string>();
        currentMenus.add(menuId);
        menuSetByInventory.set(line.inventoryItemId, currentMenus);
      }
    }

    // 실제 사용량 = OUT + WASTE
    const actualTotalByInventory = new Map<string, number>();

    for (const txn of safeInventoryTxns) {
      const itemId = String(txn.inventory_item_id);
      const type = String(txn.type);
      const qty = Number(txn.quantity);

      if (type === "OUT" || type === "WASTE") {
        actualTotalByInventory.set(itemId, (actualTotalByInventory.get(itemId) ?? 0) + qty);
      }
    }

    // 보정 제안
    const items: CalibrationItem[] = [];

    for (const [menuId, soldCount] of soldCountByMenuId.entries()) {
      if (soldCount <= 0) continue;

      const recipeId = activeRecipeIdByMenuId.get(menuId);
      if (!recipeId) continue;

      const menu = menuById.get(menuId);
      if (!menu) continue;

      const lines = recipeLinesByRecipeId.get(recipeId) ?? [];

      for (const line of lines) {
        const inventoryItem = inventoryById.get(line.inventoryItemId);
        if (!inventoryItem) continue;

        const expectedTotalQuantity =
          expectedByMenuAndInventory.get(`${menuId}:${line.inventoryItemId}`) ?? 0;

        const inventoryExpectedTotal =
          expectedTotalByInventory.get(line.inventoryItemId) ?? 0;

        const inventoryActualTotal =
          actualTotalByInventory.get(line.inventoryItemId) ?? 0;

        // 이 품목의 실제 사용량을 메뉴별 예상 비율로 배분
        const allocatedActualQuantity =
          inventoryExpectedTotal > 0
            ? (expectedTotalQuantity / inventoryExpectedTotal) * inventoryActualTotal
            : 0;

        const suggestedQuantity =
          soldCount > 0
            ? Number((allocatedActualQuantity / soldCount).toFixed(2))
            : null;

        const differencePerMenu =
          suggestedQuantity !== null
            ? Number((suggestedQuantity - line.quantity).toFixed(2))
            : null;

        const varianceRate =
          suggestedQuantity !== null && line.quantity > 0
            ? Number((((suggestedQuantity - line.quantity) / line.quantity) * 100).toFixed(2))
            : null;

        const usedByMenus = menuSetByInventory.get(line.inventoryItemId)?.size ?? 0;

        let confidence: "HIGH" | "MEDIUM" | "LOW" = "LOW";
        if (usedByMenus === 1) confidence = "HIGH";
        else if (usedByMenus <= 3) confidence = "MEDIUM";

        items.push({
          menuId,
          menuName: menu.name,
          recipeId,
          inventoryItemId: line.inventoryItemId,
          inventoryItemName: inventoryItem.name,
          unit: line.unit,
          soldCount,
          currentQuantity: line.quantity,
          expectedTotalQuantity: Number(expectedTotalQuantity.toFixed(2)),
          allocatedActualQuantity: Number(allocatedActualQuantity.toFixed(2)),
          suggestedQuantity,
          differencePerMenu,
          varianceRate,
          confidence,
        });
      }
    }

    items.sort((a, b) => {
      const av = Math.abs(a.varianceRate ?? 0);
      const bv = Math.abs(b.varianceRate ?? 0);
      return bv - av;
    });

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