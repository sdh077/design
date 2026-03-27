import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const itemId = String(searchParams.get("itemId") ?? "").trim();

        if (!itemId) {
            return NextResponse.json(
                { ok: false, message: "itemId가 필요합니다." },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("inventory_txns")
            .select("id, type, quantity, unit, note, occurred_at")
            .eq("inventory_item_id", itemId)
            .order("occurred_at", { ascending: false })
            .limit(100);

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({
            ok: true,
            rows: data ?? [],
        });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : "이력 조회 실패",
            },
            { status: 500 }
        );
    }
}