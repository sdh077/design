import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 팔로우
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });

  const { following_id } = await req.json().catch(() => ({}));
  if (!following_id) return NextResponse.json({ message: "대상이 없습니다." }, { status: 400 });
  if (following_id === user.id) return NextResponse.json({ message: "본인은 팔로우할 수 없습니다." }, { status: 400 });

  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: user.id, following_id });

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}

// 언팔로우
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });

  const { following_id } = await req.json().catch(() => ({}));
  if (!following_id) return NextResponse.json({ message: "대상이 없습니다." }, { status: 400 });

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", following_id);

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
