import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, { params }: Context) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | {
      is_recommended?: boolean;
      sort_order?: number;
      description?: string | null;
      naver_map_link?: string | null;
    }
    | null;

  const updatePayload: Record<string, unknown> = {};

  if (typeof body?.is_recommended === "boolean") {
    updatePayload.is_recommended = body.is_recommended;
  }

  if (typeof body?.sort_order === "number") {
    updatePayload.sort_order = body.sort_order;
  }

  if (typeof body?.description !== "undefined") {
    updatePayload.description = body.description?.trim() || null;
  }

  if (typeof body?.naver_map_link !== "undefined") {
    updatePayload.naver_map_link = body.naver_map_link?.trim() || null;
  }

  if (!Object.keys(updatePayload).length) {
    return NextResponse.json({ message: "수정할 값이 없습니다." }, { status: 400 });
  }

  const { error } = await supabase
    .from("places")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { message: error.message ?? "수정 실패" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: Context) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { error } = await supabase
    .from("places")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { message: error.message ?? "삭제 실패" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}