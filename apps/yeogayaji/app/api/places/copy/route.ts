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
    place_name: string | null;
    naver_map_link: string | null;
    kakao_map_link: string | null;
    description: string | null;
    lat: number | null;
    lng: number | null;
    tab_id: string | null;
  } | null;

  if (!body) {
    return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("places")
    .insert({
      user_id: user.id,
      tab_id: body.tab_id ?? null,
      place_name: body.place_name?.trim() || null,
      description: body.description?.trim() || null,
      naver_map_link: body.naver_map_link ?? "",
      kakao_map_link: body.kakao_map_link ?? null,
      naver_map_code: "",
      is_recommended: true,
      sort_order: 0,
      lat: body.lat ?? null,
      lng: body.lng ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ place: data }, { status: 201 });
}
