import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ itemId: string }> };

export async function PATCH(req: NextRequest, { params }: Context) {
  const { itemId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });

  const body = await req.json().catch(() => null) as {
    name?: string; link?: string | null; description?: string | null; time?: string | null; sort_order?: number; day?: number;
  } | null;

  const payload: Record<string, unknown> = {};
  if (body?.name?.trim()) payload.name = body.name.trim();
  if (typeof body?.link !== "undefined") payload.link = body.link?.trim() || null;
  if (typeof body?.description !== "undefined") payload.description = body.description?.trim() || null;
  if (typeof body?.time !== "undefined") payload.time = body.time?.trim() || null;
  if (typeof body?.sort_order === "number") payload.sort_order = body.sort_order;
  if (typeof body?.day === "number") payload.day = body.day;

  const { error } = await supabase.from("course_items").update(payload).eq("id", itemId);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: Context) {
  const { itemId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });

  const { error } = await supabase.from("course_items").delete().eq("id", itemId);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
