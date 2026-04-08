import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Context) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });

  const body = await req.json().catch(() => null) as { name?: string; days_count?: number } | null;
  const payload: Record<string, unknown> = {};
  if (body?.name?.trim()) payload.name = body.name.trim();
  if (typeof body?.days_count === "number") payload.days_count = body.days_count;
  if (!Object.keys(payload).length) return NextResponse.json({ message: "수정할 값이 없습니다." }, { status: 400 });

  const { error } = await supabase.from("courses").update(payload).eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: Context) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });

  const { error } = await supabase.from("courses").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
