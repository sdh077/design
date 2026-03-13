import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const storeId = String(body.storeId ?? "");
    const inventoryItemId = String(body.inventoryItemId ?? "");
    const type = String(body.type ?? "").trim();
    const quantity = Number(body.quantity ?? 0);
    const unit = String(body.unit ?? "").trim();
    const note = body.note ? String(body.note).trim() : null;
    const occurredAt = body.occurredAt
      ? String(body.occurredAt)
      : new Date().toISOString();

    if (!storeId || !inventoryItemId || !type || !quantity || !unit) {
      return NextResponse.json(
        {
          ok: false,
          message: "storeId, inventoryItemId, type, quantity, unit are required",
        },
        { status: 400 }
      );
    }

    const allowedTypes = ["IN", "OUT", "WASTE", "ADJUST", "COUNT"];
    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        { ok: false, message: "invalid type" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("inventory_txns")
      .insert({
        store_id: storeId,
        inventory_item_id: inventoryItemId,
        type,
        quantity,
        unit,
        note,
        occurred_at: occurredAt,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      ok: true,
      inventoryTxn: data,
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