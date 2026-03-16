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
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const stores = await getAccessibleStores();
    const storeIds = stores.map((store) => store.id);

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
                title="POS 연동 현황"
                description="내 가맹점 매장의 POS 연동 상태를 확인합니다."
            />

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>연결 수</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold">
                        {connections.length}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>활성 연결</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold">
                        {activeCount}
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
                    <CardTitle>연동 목록</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {connections.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                            연결된 POS 정보가 없습니다.
                        </div>
                    ) : (
                        connections.map((connection) => (
                            <div
                                key={connection.id}
                                className="rounded-xl border border-border p-4"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <div className="font-medium">
                                            {storeNameById.get(String(connection.store_id)) ?? "-"}
                                        </div>
                                        <div className="mt-1 text-sm text-muted-foreground">
                                            provider: {connection.provider}
                                        </div>
                                    </div>

                                    <div
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${connection.is_active
                                            ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                            : "border border-zinc-500/30 bg-zinc-500/10 text-zinc-300"
                                            }`}
                                    >
                                        {connection.is_active ? "ACTIVE" : "INACTIVE"}
                                    </div>
                                </div>

                                <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                                    <div>
                                        마지막 카탈로그 동기화:{" "}
                                        {connection.last_catalog_sync_at
                                            ? new Date(connection.last_catalog_sync_at).toLocaleString(
                                                "ko-KR"
                                            )
                                            : "-"}
                                    </div>
                                    <div>
                                        마지막 주문 동기화:{" "}
                                        {connection.last_order_sync_at
                                            ? new Date(connection.last_order_sync_at).toLocaleString(
                                                "ko-KR"
                                            )
                                            : "-"}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <SyncButtons storeId={connection.store_id} />
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}