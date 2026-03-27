// apps/web/app/(app)/pos-connections/page.tsx
import { Card, CardContent, CardHeader, CardTitle, PageHeader } from "@workspace/ui";
import { getAccessibleStores } from "@/lib/store/get-accessible-stores";
import { requireUser } from "@/lib/auth/require-user";
import { SyncButtons } from "@/components/pos/SyncButtons";
import { CreatePosConnectionForm } from "./pos-connection-form";

type PosConnectionRow = {
    id: string;
    store_id: string;
    provider: string;
    merchant_id: string;
    access_key: string;
    secret_key: string;
    is_active: boolean;
    last_catalog_sync_at: string | null;
    last_order_sync_at: string | null;
    created_at: string;
    updated_at: string;
};

export default async function PosConnectionsPage() {
    const { supabase } = await requireUser();

    const stores = await getAccessibleStores();
    const storeIds = stores.map((store) => String(store.id));

    let connections: PosConnectionRow[] = [];

    if (storeIds.length > 0) {
        const { data, error } = await supabase
            .from("pos_connections")
            .select("*")
            .in("store_id", storeIds)
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        connections = (data ?? []) as PosConnectionRow[];
    }

    const storeNameById = new Map(
        stores.map((store) => [String(store.id), String(store.name)])
    );

    const activeCount = connections.filter((item) => item.is_active).length;

    return (
        <div className="space-y-6">
            <PageHeader
                title="POS 연동"
                description="매장별 POS 연동 정보를 등록하고 동기화를 실행합니다."
            />

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>연결 수</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-semibold">
                        {connections.length}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>활성 연결</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-semibold">
                        {activeCount}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>대상 매장 수</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-semibold">
                        {stores.length}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>POS 연결 추가</CardTitle>
                </CardHeader>
                <CardContent>
                    {stores.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            먼저 매장을 생성해야 POS 연결을 등록할 수 있습니다.
                        </p>
                    ) : (
                        <CreatePosConnectionForm
                            stores={stores.map((store) => ({
                                id: String(store.id),
                                name: String(store.name),
                            }))}
                        />
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>연동 목록</CardTitle>
                </CardHeader>
                <CardContent>
                    {connections.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            연결된 POS 정보가 없습니다.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {connections.map((connection) => (
                                <div
                                    key={connection.id}
                                    className="rounded-xl border p-4 space-y-3"
                                >
                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="font-semibold">
                                                {storeNameById.get(String(connection.store_id)) ?? "-"}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                provider: {connection.provider}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                merchantId: {connection.merchant_id}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${connection.is_active
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                                    }`}
                                            >
                                                {connection.is_active ? "ACTIVE" : "INACTIVE"}
                                            </span>

                                            <SyncButtons storeId={String(connection.store_id)} />
                                        </div>
                                    </div>

                                    <div className="grid gap-1 text-sm text-muted-foreground">
                                        <p>
                                            마지막 카탈로그 동기화:{" "}
                                            {connection.last_catalog_sync_at
                                                ? new Date(connection.last_catalog_sync_at).toLocaleString("ko-KR")
                                                : "-"}
                                        </p>
                                        <p>
                                            마지막 주문 동기화:{" "}
                                            {connection.last_order_sync_at
                                                ? new Date(connection.last_order_sync_at).toLocaleString("ko-KR")
                                                : "-"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}