import { NextRequest, NextResponse } from "next/server";
import { calculateIntervalConsumption } from "@/lib/consumption/calculate-interval-consumption";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const storeId = String(searchParams.get("storeId") ?? "").trim();
        const fromSnapshotId = String(searchParams.get("fromSnapshotId") ?? "").trim();
        const toSnapshotId = String(searchParams.get("toSnapshotId") ?? "").trim();

        if (!storeId || !fromSnapshotId || !toSnapshotId) {
            return NextResponse.json(
                {
                    ok: false,
                    message: "storeId, fromSnapshotId, toSnapshotId가 필요합니다.",
                },
                { status: 400 }
            );
        }

        const result = await calculateIntervalConsumption({
            storeId,
            fromSnapshotId,
            toSnapshotId,
        });

        return NextResponse.json({
            ok: true,
            ...result,
        });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message:
                    error instanceof Error ? error.message : "구간 소모량 분석 실패",
            },
            { status: 500 }
        );
    }
}