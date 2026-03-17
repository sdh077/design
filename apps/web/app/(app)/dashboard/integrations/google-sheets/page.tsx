import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function GoogleSheetsIntegrationPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: account } = await supabase
        .schema("fm")
        .from("merchant_accounts")
        .select("merchant_id, role")
        .eq("auth_user_id", user.id)
        .single();

    if (!account) {
        redirect("/dashboard");
    }

    const { data: stores } = await supabase
        .schema("fm")
        .from("stores")
        .select("id, name, merchant_id")
        .eq("merchant_id", account.merchant_id)
        .order("created_at", { ascending: true });

    const storeIds = (stores ?? []).map((store) => store.id);

    const { data: connections } = await supabase
        .schema("fm")
        .from("sheet_connections")
        .select("id, store_id, google_sheet_id, is_active, last_synced_at, updated_at")
        .in("store_id", storeIds.length > 0 ? storeIds : ["00000000-0000-0000-0000-000000000000"]);

    const connectionMap = new Map(
        (connections ?? []).map((connection) => [connection.store_id, connection])
    );

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold">Google Sheets 연동</h1>
                <p className="text-sm text-muted-foreground">
                    매장별 시트 연결 상태와 최근 동기화 시간을 확인합니다.
                </p>
            </div>

            <div className="overflow-hidden rounded-xl border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 text-left">매장명</th>
                            <th className="px-4 py-3 text-left">연결 여부</th>
                            <th className="px-4 py-3 text-left">Sheet ID</th>
                            <th className="px-4 py-3 text-left">최근 동기화</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(stores ?? []).map((store) => {
                            const connection = connectionMap.get(store.id);

                            return (
                                <tr key={store.id} className="border-t">
                                    <td className="px-4 py-3">{store.name}</td>
                                    <td className="px-4 py-3">
                                        {connection?.is_active ? "연결됨" : "미연결"}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs">
                                        {connection?.google_sheet_id ?? "-"}
                                    </td>
                                    <td className="px-4 py-3">
                                        {connection?.last_synced_at
                                            ? new Date(connection.last_synced_at).toLocaleString("ko-KR")
                                            : "-"}
                                    </td>
                                </tr>
                            );
                        })}

                        {(stores ?? []).length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                    연결 가능한 매장이 없습니다.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>
        </div>
    );
}