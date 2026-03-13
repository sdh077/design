import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const storeId = String(body.storeId ?? "");
        const name = String(body.name ?? "").trim();
        const baseUnit = String(body.baseUnit ?? "").trim();
        const safetyStock = Number(body.safetyStock ?? 0);

        if (!storeId || !name || !baseUnit) {
            return NextResponse.json(
                { ok: false, message: "storeId, name, baseUnit are required" },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("inventory_items")
            .insert({
                store_id: storeId,
                name,
                base_unit: baseUnit,
                safety_stock: safetyStock,
                is_active: true,
            })
            .select("*")
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({
            ok: true,
            inventoryItem: data,
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