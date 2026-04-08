import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ courses: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });

  const body = await req.json().catch(() => null) as { name: string; days_count: number } | null;
  if (!body?.name?.trim()) return NextResponse.json({ message: "코스 이름을 입력해주세요." }, { status: 400 });

  const { data, error } = await supabase
    .from("courses")
    .insert({ user_id: user.id, name: body.name.trim(), days_count: body.days_count ?? 1 })
    .select("*")
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ course: data }, { status: 201 });
}
