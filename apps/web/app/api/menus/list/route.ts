import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type MenuRow = {
    id: string;
    store_id: string;
    name: string;
    is_active: boolean;
    updated_at: string;
};

type RecipeRow = {
    menu_id: string;
};

type MappingJoinRow = {
    menu_id: string;
    external_catalog_items: {
        id: string;
        title: string;
        external_item_id: string;
        code: string | null;
    } | null;
};

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

        const { data: menus, error: menusError } = await supabase
            .from("menus")
            .select("id, store_id, name, is_active, updated_at")
            .eq("store_id", storeId)
            .order("name", { ascending: true });

        if (menusError) {
            throw new Error(menusError.message);
        }

        const menuIds = (menus ?? []).map((menu) => menu.id);

        let recipeMenuIdSet = new Set<string>();
        let mappingMap = new Map<
            string,
            {
                external_catalog_item_id: string | null;
                external_title: string | null;
                external_item_id: string | null;
                external_code: string | null;
            }
        >();

        if (menuIds.length > 0) {
            const [
                { data: recipeRows, error: recipeError },
                { data: mappingRows, error: mappingError },
            ] = await Promise.all([
                supabase.from("recipes").select("menu_id").in("menu_id", menuIds),
                supabase
                    .from("menu_external_item_maps")
                    .select(`
            menu_id,
            external_catalog_item_id,
            external_catalog_items (
              id,
              title,
              external_item_id,
              code
            )
          `)
                    .in("menu_id", menuIds),
            ]);

            if (recipeError) {
                throw new Error(recipeError.message);
            }

            if (mappingError) {
                throw new Error(mappingError.message);
            }

            recipeMenuIdSet = new Set(
                ((recipeRows ?? []) as RecipeRow[]).map((row) => String(row.menu_id))
            );

            for (const row of (mappingRows ?? []) as any[]) {
                mappingMap.set(String(row.menu_id), {
                    external_catalog_item_id: row.external_catalog_item_id ?? null,
                    external_title: row.external_catalog_items?.title ?? null,
                    external_item_id: row.external_catalog_items?.external_item_id ?? null,
                    external_code: row.external_catalog_items?.code ?? null,
                });
            }
        }

        const rows = ((menus ?? []) as MenuRow[]).map((menu) => {
            const mapping = mappingMap.get(String(menu.id));

            return {
                ...menu,
                has_recipe: recipeMenuIdSet.has(String(menu.id)),
                has_external_mapping: Boolean(mapping),
                external_mapping: mapping ?? null,
            };
        });

        return NextResponse.json({
            ok: true,
            rows,
        });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : "메뉴 조회 실패",
            },
            { status: 500 }
        );
    }
}