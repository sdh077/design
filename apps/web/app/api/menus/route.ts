import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const storeId = String(body.storeId ?? "");
    const name = String(body.name ?? "").trim();

    if (!storeId || !name) {
      return NextResponse.json(
        { ok: false, message: "storeId, name are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("menus")
      .insert({
        store_id: storeId,
        name,
        is_active: true,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      ok: true,
      menu: data,
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