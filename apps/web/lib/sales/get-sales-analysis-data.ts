import { createAdminClient } from "@/lib/supabase/admin";

type ExternalOrderRow = {
    id: string;
    store_id: string;
    provider: string;
    order_state: string;
    ordered_at: string;
    total_amount: number | null;
};

export type SalesAnalysisSnapshot = {
    generatedAt: string;
    range: {
        from: string;
        to: string;
        days: number;
    };
    summary: {
        totalSales: number;
        totalOrders: number;
        completedOrders: number;
        averageOrderValue: number;
        completionRate: number;
    };
    byDay: Array<{
        date: string;
        sales: number;
        orders: number;
    }>;
    byStore: Array<{
        storeId: string;
        storeName: string;
        sales: number;
        orders: number;
    }>;
    byProvider: Array<{
        provider: string;
        sales: number;
        orders: number;
    }>;
};

function toKstDateKey(value: string) {
    return new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date(value));
}

export async function getSalesAnalysisData(days = 7): Promise<SalesAnalysisSnapshot> {
    const supabase = createAdminClient();

    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    from.setHours(0, 0, 0, 0);

    const [{ data: orders, error: orderError }, { data: stores, error: storeError }] =
        await Promise.all([
            supabase
                .from("external_orders")
                .select("id, store_id, provider, order_state, ordered_at, total_amount")
                .gte("ordered_at", from.toISOString())
                .lte("ordered_at", to.toISOString())
                .order("ordered_at", { ascending: true }),
            supabase.from("stores").select("id, name"),
        ]);

    if (orderError) {
        throw new Error(orderError.message);
    }

    if (storeError) {
        throw new Error(storeError.message);
    }

    const storeNameById = new Map(
        (stores ?? []).map((store) => [String(store.id), String(store.name)])
    );

    const rows = (orders ?? []) as ExternalOrderRow[];
    const completedRows = rows.filter((row) => row.order_state === "COMPLETED");

    const totalSales = completedRows.reduce(
        (sum, row) => sum + (row.total_amount ?? 0),
        0
    );

    const totalOrders = rows.length;
    const completedOrders = completedRows.length;
    const averageOrderValue =
        completedOrders > 0 ? Math.round(totalSales / completedOrders) : 0;
    const completionRate =
        totalOrders > 0
            ? Number(((completedOrders / totalOrders) * 100).toFixed(1))
            : 0;

    const dayMap = new Map<string, { sales: number; orders: number }>();
    const storeMap = new Map<string, { sales: number; orders: number }>();
    const providerMap = new Map<string, { sales: number; orders: number }>();

    for (const row of completedRows) {
        const amount = row.total_amount ?? 0;
        const dayKey = toKstDateKey(row.ordered_at);
        const storeKey = String(row.store_id);
        const providerKey = row.provider || "unknown";

        dayMap.set(dayKey, {
            sales: (dayMap.get(dayKey)?.sales ?? 0) + amount,
            orders: (dayMap.get(dayKey)?.orders ?? 0) + 1,
        });

        storeMap.set(storeKey, {
            sales: (storeMap.get(storeKey)?.sales ?? 0) + amount,
            orders: (storeMap.get(storeKey)?.orders ?? 0) + 1,
        });

        providerMap.set(providerKey, {
            sales: (providerMap.get(providerKey)?.sales ?? 0) + amount,
            orders: (providerMap.get(providerKey)?.orders ?? 0) + 1,
        });
    }

    return {
        generatedAt: new Date().toISOString(),
        range: {
            from: from.toISOString(),
            to: to.toISOString(),
            days,
        },
        summary: {
            totalSales,
            totalOrders,
            completedOrders,
            averageOrderValue,
            completionRate,
        },
        byDay: Array.from(dayMap.entries())
            .map(([date, value]) => ({
                date,
                sales: value.sales,
                orders: value.orders,
            }))
            .sort((a, b) => a.date.localeCompare(b.date)),
        byStore: Array.from(storeMap.entries())
            .map(([storeId, value]) => ({
                storeId,
                storeName: storeNameById.get(storeId) ?? "이름 없는 매장",
                sales: value.sales,
                orders: value.orders,
            }))
            .sort((a, b) => b.sales - a.sales),
        byProvider: Array.from(providerMap.entries())
            .map(([provider, value]) => ({
                provider,
                sales: value.sales,
                orders: value.orders,
            }))
            .sort((a, b) => b.sales - a.sales),
    };
}