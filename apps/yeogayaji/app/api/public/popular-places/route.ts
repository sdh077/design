import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type PopularPlaceRow = {
  naver_map_code: string;
  place_name: string | null;
  count: number | string;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Math.min(
    Math.max(Number(url.searchParams.get("limit") ?? "8") || 8, 1),
    20
  );

  try {
    const admin = createAdminClient();

    const { data, error } = await admin.rpc("get_popular_places", {
      limit_count: limit,
    });

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as PopularPlaceRow[];
    const places = rows.map((row) => ({
      naver_map_code: row.naver_map_code as string,
      place_name: (row.place_name as string | null) ?? null,
      count: Number(row.count ?? 0),
      naver_map_link: `https://naver.me/${row.naver_map_code as string}`,
    }));

    return NextResponse.json({ places });
  } catch (err) {
    return NextResponse.json(
      { places: [], message: err instanceof Error ? err.message : "조회 실패" },
      { status: 500 }
    );
  }
}

