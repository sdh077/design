import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getAuthorizedRecipe(recipeId: string, userId: string) {
    const admin = createAdminClient();

    const { data: merchantAccount, error: accountError } = await admin
        .from("merchant_accounts")
        .select("merchant_id")
        .eq("auth_user_id", userId)
        .maybeSingle();

    if (accountError || !merchantAccount?.merchant_id) {
        throw new Error("가맹점 계정 정보가 없습니다.");
    }

    const { data: recipe, error: recipeError } = await admin
        .from("recipes")
        .select("id, store_id")
        .eq("id", recipeId)
        .maybeSingle();

    if (recipeError || !recipe) {
        throw new Error("레시피를 찾을 수 없습니다.");
    }

    const { data: store, error: storeError } = await admin
        .from("stores")
        .select("id, merchant_id")
        .eq("id", recipe.store_id)
        .maybeSingle();

    if (storeError || !store) {
        throw new Error("매장을 찾을 수 없습니다.");
    }

    if (store.merchant_id !== merchantAccount.merchant_id) {
        throw new Error("해당 레시피에 접근할 수 없습니다.");
    }

    return { admin, recipe };
}

export async function GET(
    req: NextRequest,
    ctx: RouteContext<"/api/recipes/[recipeId]/lines">
) {
    try {
        const { recipeId } = await ctx.params;

        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { ok: false, message: "로그인이 필요합니다." },
                { status: 401 }
            );
        }

        const { admin } = await getAuthorizedRecipe(recipeId, user.id);

        const { data, error } = await admin
            .from("recipe_lines")
            .select("*")
            .eq("recipe_id", recipeId);

        if (error) throw new Error(error.message);

        return NextResponse.json({ ok: true, lines: data });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : "레시피 라인 조회 실패",
            },
            { status: 500 }
        );
    }
}

export async function POST(
    req: NextRequest,
    ctx: RouteContext<"/api/recipes/[recipeId]/lines">
) {
    try {
        const { recipeId } = await ctx.params;

        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { ok: false, message: "로그인이 필요합니다." },
                { status: 401 }
            );
        }

        const body = await req.json();
        const inventoryItemId = String(body.inventoryItemId ?? "");
        const quantity = Number(body.quantity ?? 0);
        const unit = String(body.unit ?? "");

        const { admin, recipe } = await getAuthorizedRecipe(recipeId, user.id);

        const { data: item, error: itemError } = await admin
            .from("inventory_items")
            .select("id, store_id")
            .eq("id", inventoryItemId)
            .maybeSingle();

        if (itemError || !item || item.store_id !== recipe.store_id) {
            return NextResponse.json(
                { ok: false, message: "해당 재고 품목에 접근할 수 없습니다." },
                { status: 403 }
            );
        }

        const { data, error } = await admin
            .from("recipe_lines")
            .insert({
                recipe_id: recipeId,
                inventory_item_id: inventoryItemId,
                quantity,
                unit,
            })
            .select("*")
            .single();

        if (error) throw new Error(error.message);

        return NextResponse.json({ ok: true, line: data });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : "레시피 라인 추가 실패",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    ctx: RouteContext<"/api/recipes/[recipeId]/lines">
) {
    try {
        const { recipeId } = await ctx.params;

        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { ok: false, message: "로그인이 필요합니다." },
                { status: 401 }
            );
        }

        const body = await req.json();
        const lineId = String(body.lineId ?? "");

        const { admin } = await getAuthorizedRecipe(recipeId, user.id);

        const { error } = await admin
            .from("recipe_lines")
            .delete()
            .eq("id", lineId)
            .eq("recipe_id", recipeId);

        if (error) throw new Error(error.message);

        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : "레시피 라인 삭제 실패",
            },
            { status: 500 }
        );
    }
}