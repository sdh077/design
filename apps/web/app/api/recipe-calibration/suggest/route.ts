import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateIntervalConsumption } from "@/lib/consumption/calculate-interval-consumption";

function num(v: unknown) {
    const n = Number(v ?? 0);
    return Number.isFinite(n) ? n : 0;
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const storeId = String(searchParams.get("storeId") ?? "").trim();
        const intervalCount = Number(searchParams.get("intervalCount") ?? 3);

        if (!storeId) {
            return NextResponse.json(
                { ok: false, message: "storeId가 필요합니다." },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const { data: snapshots, error: snapshotsError } = await supabase
            .from("inventory_snapshots")
            .select("id, snapshot_at")
            .eq("store_id", storeId)
            .order("snapshot_at", { ascending: false });

        if (snapshotsError) {
            throw new Error(snapshotsError.message);
        }

        const uniqueSnapshots = Array.from(
            new Map(
                (snapshots ?? []).map((row) => [String(row.id), row])
            ).values()
        ).sort(
            (a, b) =>
                new Date(a.snapshot_at).getTime() - new Date(b.snapshot_at).getTime()
        );

        if (uniqueSnapshots.length < 2) {
            return NextResponse.json({
                ok: true,
                rows: [],
            });
        }

        const recentPairs: Array<{ fromId: string; toId: string }> = [];
        for (
            let i = Math.max(0, uniqueSnapshots.length - 1 - intervalCount);
            i < uniqueSnapshots.length - 1;
            i += 1
        ) {
            const fromSnapshot = uniqueSnapshots[i];
            const toSnapshot = uniqueSnapshots[i + 1];

            if (!fromSnapshot || !toSnapshot) continue;

            recentPairs.push({
                fromId: String(fromSnapshot.id),
                toId: String(toSnapshot.id),
            });
        }

        const aggregates = new Map<
            string,
            {
                expected: number;
                actual: number;
                observedIntervals: number;
            }
        >();

        for (const pair of recentPairs) {
            const interval = await calculateIntervalConsumption({
                storeId,
                fromSnapshotId: pair.fromId,
                toSnapshotId: pair.toId,
            });

            for (const row of interval.dailyRows) {
                const key = String(row.inventory_item_id);
                const prev = aggregates.get(key) ?? {
                    expected: 0,
                    actual: 0,
                    observedIntervals: 0,
                };

                aggregates.set(key, {
                    expected: prev.expected + num(row.expected_quantity),
                    actual: prev.actual + num(row.actual_quantity),
                    observedIntervals: prev.observedIntervals + 1,
                });
            }
        }

        const { data: menuData, error: menuError } = await supabase
            .from("menus")
            .select("id, name")
            .eq("store_id", storeId);

        if (menuError) {
            throw new Error(menuError.message);
        }

        const menuMap = new Map(
            (menuData ?? []).map((row) => [String(row.id), String(row.name)])
        );

        const { data: recipeLines, error: recipeLinesError } = await supabase
            .from("recipe_lines")
            .select(`
        id,
        inventory_item_id,
        quantity,
        unit,
        recipes!inner(
          id,
          menu_id
        ),
        inventory_items!inner(
          id,
          name
        )
      `);

        if (recipeLinesError) {
            throw new Error(recipeLinesError.message);
        }

        const rows = [];

        for (const line of recipeLines as any[]) {
            const menuId = String(line.recipes?.menu_id ?? "");
            const inventoryItemId = String(line.inventory_item_id ?? "");
            const currentRecipeQuantity = num(line.quantity);

            if (!menuId || !inventoryItemId || currentRecipeQuantity <= 0) continue;

            const agg = aggregates.get(inventoryItemId);
            if (!agg || agg.expected <= 0) continue;

            const ratio = agg.actual / agg.expected;
            const suggestedRecipeQuantity = currentRecipeQuantity * ratio;
            const gapQuantity = agg.actual - agg.expected;

            const confidenceBase =
                agg.expected >= 100 ? 0.9 :
                    agg.expected >= 50 ? 0.75 :
                        agg.expected >= 20 ? 0.6 : 0.4;

            const confidenceIntervals =
                agg.observedIntervals >= 3 ? 0.1 :
                    agg.observedIntervals >= 2 ? 0.05 : 0;

            const confidenceScore = Math.min(
                0.99,
                confidenceBase + confidenceIntervals
            );

            rows.push({
                menu_id: menuId,
                menu_name: menuMap.get(menuId) ?? "-",
                inventory_item_id: inventoryItemId,
                inventory_item_name: String(line.inventory_items?.name ?? "-"),
                unit: String(line.unit ?? ""),
                current_recipe_quantity: currentRecipeQuantity,
                suggested_recipe_quantity: Number(suggestedRecipeQuantity.toFixed(2)),
                expected_quantity: Number(agg.expected.toFixed(2)),
                actual_quantity: Number(agg.actual.toFixed(2)),
                gap_quantity: Number(gapQuantity.toFixed(2)),
                confidence_score: confidenceScore,
                ratio: Number(ratio.toFixed(4)),
            });
        }

        return NextResponse.json({
            ok: true,
            rows: rows
                .filter((row) => Math.abs(row.ratio - 1) >= 0.05)
                .sort((a, b) => Math.abs(b.ratio - 1) - Math.abs(a.ratio - 1)),
        });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message:
                    error instanceof Error ? error.message : "레시피 보정 추천 실패",
            },
            { status: 500 }
        );
    }
}