import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    place_name: string;
    place_url: string;
    address: string;
    description?: string | null;
    tab_id?: string | null;
    lat?: number | null;
    lng?: number | null;
  } | null;

  if (!body?.place_name || !body?.place_url) {
    return NextResponse.json({ message: "장소 정보가 올바르지 않습니다." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("places")
    .insert({
      user_id: user.id,
      tab_id: body.tab_id ?? null,
      place_name: body.place_name.trim(),
      description: body.description?.trim() || null,
      naver_map_link: body.place_url,
      naver_map_code: "",
      is_recommended: true,
      sort_order: 0,
      lat: body.lat ?? null,
      lng: body.lng ?? null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ place: data }, { status: 201 });
}
