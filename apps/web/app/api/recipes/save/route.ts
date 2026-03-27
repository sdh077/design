import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RecipeLinePayload = {
    id?: string;
    inventory_item_id: string;
    quantity: number;
    unit: string;
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const storeId = String(body?.storeId ?? "").trim();
        const menuId = String(body?.menuId ?? "").trim();
        const recipeName = String(body?.recipeName ?? "").trim();
        const lines = (body?.lines ?? []) as RecipeLinePayload[];

        if (!storeId || !menuId || !recipeName) {
            return NextResponse.json(
                { ok: false, message: "필수값이 누락되었습니다." },
                { status: 400 }
            );
        }

        if (lines.length === 0) {
            return NextResponse.json(
                { ok: false, message: "재료를 한 개 이상 입력해주세요." },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const { data: menu, error: menuError } = await supabase
            .from("menus")
            .select("id, store_id")
            .eq("id", menuId)
            .eq("store_id", storeId)
            .single();

        if (menuError || !menu) {
            throw new Error(menuError?.message ?? "메뉴를 찾을 수 없습니다.");
        }

        let recipeId = "";

        const { data: existingRecipe, error: existingRecipeError } = await supabase
            .from("recipes")
            .select("id")
            .eq("menu_id", menuId)
            .maybeSingle();

        if (existingRecipeError) {
            throw new Error(existingRecipeError.message);
        }

        if (existingRecipe) {
            recipeId = existingRecipe.id;

            const { error: updateError } = await supabase
                .from("recipes")
                .update({
                    name: recipeName,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", recipeId);

            if (updateError) {
                throw new Error(updateError.message);
            }
        } else {
            const { data: createdRecipe, error: createError } = await supabase
                .from("recipes")
                .insert({
                    menu_id: menuId,
                    name: recipeName,
                })
                .select("id")
                .single();

            if (createError || !createdRecipe) {
                throw new Error(createError?.message ?? "레시피 생성에 실패했습니다.");
            }

            recipeId = createdRecipe.id;
        }

        const { error: deleteLinesError } = await supabase
            .from("recipe_lines")
            .delete()
            .eq("recipe_id", recipeId);

        if (deleteLinesError) {
            throw new Error(deleteLinesError.message);
        }

        const insertPayload = lines.map((line) => ({
            recipe_id: recipeId,
            inventory_item_id: String(line.inventory_item_id),
            quantity: Number(line.quantity),
            unit: String(line.unit).trim(),
        }));

        const { error: insertLinesError } = await supabase
            .from("recipe_lines")
            .insert(insertPayload);

        if (insertLinesError) {
            throw new Error(insertLinesError.message);
        }

        return NextResponse.json({
            ok: true,
            recipeId,
        });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : "레시피 저장 실패",
            },
            { status: 500 }
        );
    }
}