import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const storeId = String(searchParams.get("storeId") ?? "").trim();

        if (!storeId) {
            return NextResponse.json(
                { ok: false, message: "storeId가 필요합니다." },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const [{ data: menus, error: menusError }, { data: inventoryItems, error: inventoryError }] =
            await Promise.all([
                supabase
                    .from("menus")
                    .select("id, name, is_active")
                    .eq("store_id", storeId)
                    .order("name", { ascending: true }),
                supabase
                    .from("inventory_items")
                    .select("id, name, base_unit, is_active")
                    .eq("store_id", storeId)
                    .eq("is_active", true)
                    .order("name", { ascending: true }),
            ]);

        if (menusError) {
            throw new Error(menusError.message);
        }

        if (inventoryError) {
            throw new Error(inventoryError.message);
        }

        const menuIds = (menus ?? []).map((menu) => menu.id);

        let recipes: Array<{
            id: string;
            menu_id: string;
            name: string | null;
        }> = [];

        let recipeLines: Array<{
            id: string;
            recipe_id: string;
            inventory_item_id: string;
            quantity: number;
            unit: string;
        }> = [];

        if (menuIds.length > 0) {
            const { data: recipeData, error: recipeError } = await supabase
                .from("recipes")
                .select("id, menu_id, name")
                .in("menu_id", menuIds);

            if (recipeError) {
                throw new Error(recipeError.message);
            }

            recipes = recipeData ?? [];

            const recipeIds = recipes.map((recipe) => recipe.id);

            if (recipeIds.length > 0) {
                const { data: lineData, error: lineError } = await supabase
                    .from("recipe_lines")
                    .select("id, recipe_id, inventory_item_id, quantity, unit")
                    .in("recipe_id", recipeIds);

                if (lineError) {
                    throw new Error(lineError.message);
                }

                recipeLines = lineData ?? [];
            }
        }

        return NextResponse.json({
            ok: true,
            menus: menus ?? [],
            inventoryItems: inventoryItems ?? [],
            recipes,
            recipeLines,
        });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : "레시피 데이터 조회 실패",
            },
            { status: 500 }
        );
    }
}