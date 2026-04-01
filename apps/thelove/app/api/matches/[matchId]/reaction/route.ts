import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;
  return NextResponse.json({ ok: true, route: `matches/${matchId}/reaction` });
}
