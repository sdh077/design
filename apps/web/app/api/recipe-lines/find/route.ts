import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const recipeId = String(req.nextUrl.searchParams.get("recipeId") ?? "");
    const inventoryItemId = String(req.nextUrl.searchParams.get("inventoryItemId") ?? "");

    if (!recipeId || !inventoryItemId) {
      return NextResponse.json(
        { ok: false, message: "recipeId and inventoryItemId are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("recipe_lines")
      .select("id")
      .eq("recipe_id", recipeId)
      .eq("inventory_item_id", inventoryItemId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      ok: true,
      recipeLineId: data?.id ?? null,
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