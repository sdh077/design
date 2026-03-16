import { redirect } from "next/navigation";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    PageHeader,
} from "@workspace/ui";
import { createClient } from "@/lib/supabase/server";
import { getAccessibleStores } from "@/lib/store/get-accessible-stores";
import { SyncButtons } from "@/components/pos/SyncButtons";

type ExternalOrderRow = {
    id: string;
    store_id: string;
    provider: string;
    external_order_id: string;
    order_state: string;
    ordered_at: string;
    completed_at: string | null;
    cancelled_at: string | null;
    total_amount: number | null;
    raw_json: unknown;
    synced_at: string;
    created_at: string;
    updated_at: string;
};

export default async function ExternalOrdersPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const stores = await getAccessibleStores();
    const storeIds = stores.map((store) => store.id);

    let orders: ExternalOrderRow[] = [];

    if (storeIds.length > 0) {
        const { data, error } = await supabase
            .from("external_orders")
            .select("*")
            .in("store_id", storeIds)
            .order("ordered_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        orders = (data ?? []) as ExternalOrderRow[];
    }

    const storeNameById = new Map(
        stores.map((store) => [String(store.id), String(store.name)])
    );

    const completedCount = orders.filter(
        (order) => order.order_state === "COMPLETED"
    ).length;

    return (
        <div className="space-y-6">
            <PageHeader
                title="외부 주문 현황"
                description="내 가맹점 매장으로 들어온 외부 주문을 확인합니다."
            />

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>전체 주문 수</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold">
                        {orders.length}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>완료 주문 수</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold">
                        {completedCount}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>대상 매장 수</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold">
                        {stores.length}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>주문 목록</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {orders.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                            외부 주문 데이터가 없습니다.
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div
                                key={order.id}
                                className="rounded-xl border border-border p-4"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <div className="font-medium">
                                            {storeNameById.get(String(order.store_id)) ?? "-"}
                                        </div>
                                        <div className="mt-1 text-sm text-muted-foreground">
                                            {order.provider} / 주문번호: {order.external_order_id}
                                        </div>
                                    </div>

                                    <div className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground">
                                        {order.order_state}
                                    </div>
                                </div>

                                <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                                    <div>
                                        주문시각:{" "}
                                        {new Date(order.ordered_at).toLocaleString("ko-KR")}
                                    </div>
                                    <div>
                                        금액:{" "}
                                        {order.total_amount != null
                                            ? `${order.total_amount.toLocaleString("ko-KR")}원`
                                            : "-"}
                                    </div>
                                    <div>
                                        완료시각:{" "}
                                        {order.completed_at
                                            ? new Date(order.completed_at).toLocaleString("ko-KR")
                                            : "-"}
                                    </div>
                                    <div>
                                        취소시각:{" "}
                                        {order.cancelled_at
                                            ? new Date(order.cancelled_at).toLocaleString("ko-KR")
                                            : "-"}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <SyncButtons storeId={order.store_id} />
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}