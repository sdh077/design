import { redirect } from "next/navigation";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    PageHeader,
    StatCard,
} from "@workspace/ui";
import { createClient } from "@/lib/supabase/server";
import { getAccessibleStores } from "@/lib/store/get-accessible-stores";
import { StoreActions } from "@/components/stores/StoreActions";

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const stores = await getAccessibleStores();
    const storeIds = stores.map((store) => store.id);

    let posCount = 0;
    let catalogCount = 0;
    let orderCount = 0;

    if (storeIds.length > 0) {
        const [
            { count: posConnectionsCount, error: posError },
            { count: catalogItemsCount, error: catalogError },
            { count: externalOrdersCount, error: orderError },
        ] = await Promise.all([
            supabase
                .from("pos_connections")
                .select("*", { count: "exact", head: true })
                .in("store_id", storeIds),
            supabase
                .from("external_catalog_items")
                .select("*", { count: "exact", head: true })
                .in("store_id", storeIds),
            supabase
                .from("external_orders")
                .select("*", { count: "exact", head: true })
                .in("store_id", storeIds),
        ]);

        if (posError) throw new Error(posError.message);
        if (catalogError) throw new Error(catalogError.message);
        if (orderError) throw new Error(orderError.message);

        posCount = posConnectionsCount ?? 0;
        catalogCount = catalogItemsCount ?? 0;
        orderCount = externalOrdersCount ?? 0;
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="대시보드"
                description="내 가맹점에 속한 매장 기준 현황입니다."
            />

            <div className="grid gap-4 md:grid-cols-4">
                <StatCard title="내 매장 수" value={String(stores.length)} />
                <StatCard title="POS 연결 수" value={String(posCount)} />
                <StatCard title="동기화된 카탈로그 수" value={String(catalogCount)} />
                <StatCard title="외부 주문 수" value={String(orderCount)} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>접근 가능한 매장</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {stores.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            현재 계정에 연결된 매장이 없습니다.
                        </p>
                    ) : (
                        stores.map((store) => (
                            <div
                                key={store.id}
                                className="rounded-xl border border-border p-4"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="font-medium">{store.name}</div>
                                        <div className="mt-1 text-sm text-muted-foreground">
                                            code: {store.code ?? "-"} / timezone: {store.timezone}
                                        </div>
                                        <div className="mt-1 text-sm text-muted-foreground">
                                            {store.address ?? "-"}
                                        </div>
                                    </div>

                                    <StoreActions store={store} />
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}