import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const quantity = Number(body.quantity ?? 0);
    const unit = body.unit ? String(body.unit).trim() : undefined;

    if (!quantity) {
      return NextResponse.json(
        { ok: false, message: "quantity is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const payload: Record<string, unknown> = {
      quantity,
    };

    if (unit) {
      payload.unit = unit;
    }

    const { data, error } = await supabase
      .from("recipe_lines")
      .update(payload)
      .eq("id", id)
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

export async function DELETE(_: NextRequest, context: Context) {
  try {
    const { id } = await context.params;

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("recipe_lines")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true });
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