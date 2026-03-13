import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const recipeId = String(body.recipeId ?? "");
        const inventoryItemId = String(body.inventoryItemId ?? "");
        const quantity = Number(body.quantity ?? 0);
        const unit = String(body.unit ?? "").trim();

        if (!recipeId || !inventoryItemId || !quantity || !unit) {
            return NextResponse.json(
                {
                    ok: false,
                    message: "recipeId, inventoryItemId, quantity, unit are required",
                },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("recipe_lines")
            .insert({
                recipe_id: recipeId,
                inventory_item_id: inventoryItemId,
                quantity,
                unit,
            })
            .select("*")
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({
            ok: true,
            recipeLine: data,
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