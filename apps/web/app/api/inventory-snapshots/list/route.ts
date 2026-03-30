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

        const { data, error } = await supabase
            .from("inventory_snapshots")
            .select(`
        id,
        snapshot_at,
        inventory_item_id,
        quantity,
        unit,
        inventory_items (
          id,
          name
        )
      `)
            .eq("store_id", storeId)
            .order("snapshot_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        const grouped = new Map<
            string,
            {
                id: string;
                snapshot_at: string;
                item_count: number;
            }
        >();

        for (const row of data ?? []) {
            const id = String(row.id);
            if (!grouped.has(id)) {
                grouped.set(id, {
                    id,
                    snapshot_at: String(row.snapshot_at),
                    item_count: 0,
                });
            }
            grouped.get(id)!.item_count += 1;
        }

        return NextResponse.json({
            ok: true,
            rows: Array.from(grouped.values()).sort(
                (a, b) =>
                    new Date(b.snapshot_at).getTime() - new Date(a.snapshot_at).getTime()
            ),
        });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message:
                    error instanceof Error ? error.message : "스냅샷 목록 조회 실패",
            },
            { status: 500 }
        );
    }
}