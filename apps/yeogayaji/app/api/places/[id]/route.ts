import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/places/[id]">
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "로그인 필요" },
      { status: 401 }
    );
  }

  const { id } = await ctx.params;

  const { data, error } = await supabase
    .from("places")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ place: data });
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/places/[id]">
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "로그인 필요" },
      { status: 401 }
    );
  }

  const { id } = await ctx.params;

  const { error } = await supabase
    .from("places")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

