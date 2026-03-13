import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

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