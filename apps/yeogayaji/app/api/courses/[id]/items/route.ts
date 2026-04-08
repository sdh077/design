import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Context) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("course_items")
    .select("*")
    .eq("course_id", id)
    .order("day", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function POST(req: NextRequest, { params }: Context) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });

  // 코스 소유자 확인
  const { data: course } = await supabase.from("courses").select("user_id").eq("id", id).single();
  if (course?.user_id !== user.id) return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });

  const body = await req.json().catch(() => null) as {
    day: number; name: string; link?: string; description?: string; time?: string; sort_order?: number;
  } | null;
  if (!body?.name?.trim()) return NextResponse.json({ message: "이름을 입력해주세요." }, { status: 400 });

  const { data, error } = await supabase
    .from("course_items")
    .insert({
      course_id: id,
      day: body.day ?? 1,
      name: body.name.trim(),
      link: body.link?.trim() || null,
      description: body.description?.trim() || null,
      time: body.time?.trim() || null,
      sort_order: body.sort_order ?? 0,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ item: data }, { status: 201 });
}
