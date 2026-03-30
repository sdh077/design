import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type SnapshotInput = {
    inventory_item_id: string;
    quantity: number;
    unit: string;
    note?: string | null;
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const storeId = String(body.storeId ?? "").trim();
        const snapshotAt = String(body.snapshotAt ?? "").trim();
        const rows = (body.rows ?? []) as SnapshotInput[];

        if (!storeId || !snapshotAt) {
            return NextResponse.json(
                { ok: false, message: "storeId, snapshotAt이 필요합니다." },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        for (const row of rows) {
            const inventoryItemId = String(row.inventory_item_id ?? "").trim();
            const quantity = Number(row.quantity ?? 0);
            const unit = String(row.unit ?? "").trim();

            if (!inventoryItemId || !unit) continue;

            const { error } = await supabase.from("inventory_snapshots").insert({
                store_id: storeId,
                inventory_item_id: inventoryItemId,
                snapshot_at: snapshotAt,
                quantity,
                unit,
                note: row.note ?? null,
            });

            if (error) {
                throw new Error(error.message);
            }
        }

        return NextResponse.json({
            ok: true,
            message: "스냅샷이 저장되었습니다.",
        });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message:
                    error instanceof Error ? error.message : "스냅샷 저장 실패",
            },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const snapshotId = String(searchParams.get("snapshotId") ?? "").trim();

        if (!snapshotId) {
            return NextResponse.json(
                { ok: false, message: "snapshotId가 필요합니다." },
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
        note,
        inventory_items (
          id,
          name
        )
      `)
            .eq("id", snapshotId);

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
                message:
                    error instanceof Error ? error.message : "스냅샷 조회 실패",
            },
            { status: 500 }
        );
    }
}