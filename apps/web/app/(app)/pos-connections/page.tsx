import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle, PageHeader } from "@workspace/ui";
import { CreatePosConnectionForm } from "./pos-connection-form";
import { SyncButtons } from "./sync-buttons";

export default async function PosConnectionsPage() {
    const supabase = createAdminClient();

    const { data: stores, error: storesError } = await supabase
        .from("stores")
        .select("id, name")
        .order("created_at", { ascending: false });

    if (storesError) {
        throw new Error(storesError.message);
    }

    const { data: connections, error: connectionsError } = await supabase
        .from("pos_connections")
        .select("*")
        .order("created_at", { ascending: false });

    if (connectionsError) {
        throw new Error(connectionsError.message);
    }

    return (
        <div>
            <PageHeader
                title="POS 연결"
                description="매장별 Toss POS 연결 정보를 등록하고 동기화를 실행한다."
            />

            <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
                <Card>
                    <CardHeader>
                        <CardTitle>POS 연결 등록</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CreatePosConnectionForm stores={stores ?? []} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>POS 연결 목록</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {connections?.map((connection) => (
                                <div
                                    key={connection.id}
                                    className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                                >
                                    <div className="font-medium text-zinc-100">
                                        {connection.provider}
                                    </div>
                                    <div className="mt-1 text-sm text-zinc-400">
                                        merchant_id: {connection.merchant_id}
                                    </div>

                                    <div className="mt-4">
                                        <SyncButtons storeId={connection.store_id} />
                                    </div>
                                </div>
                            ))}

                            {!connections?.length ? (
                                <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
                                    아직 POS 연결이 없다.
                                </div>
                            ) : null}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}