import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
    req: NextRequest,
    { params }: { params: { recipeId: string } }
) {
    const admin = createAdminClient();

    const { data, error } = await admin
        .from("recipe_lines")
        .select("*")
        .eq("recipe_id", params.recipeId);

    if (error) {
        return NextResponse.json({ ok: false, message: error.message });
    }

    return NextResponse.json({ ok: true, lines: data });
}

export async function POST(
    req: NextRequest,
    { params }: { params: { recipeId: string } }
) {
    try {
        const body = await req.json();

        const inventoryItemId = String(body.inventoryItemId ?? "");
        const quantity = Number(body.quantity ?? 0);
        const unit = String(body.unit ?? "");

        const admin = createAdminClient();

        const { data, error } = await admin
            .from("recipe_lines")
            .insert({
                recipe_id: params.recipeId,
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
            { ok: false, message: String(error) },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();

        const lineId = String(body.lineId ?? "");

        const admin = createAdminClient();

        const { error } = await admin
            .from("recipe_lines")
            .delete()
            .eq("id", lineId);

        if (error) throw new Error(error.message);

        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json(
            { ok: false, message: String(error) },
            { status: 500 }
        );
    }
}