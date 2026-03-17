import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ExternalOrdersPage() {
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
        .select("merchant_id")
        .eq("auth_user_id", user.id)
        .single();

    if (!account) {
        redirect("/dashboard");
    }

    const { data: stores } = await supabase
        .schema("fm")
        .from("stores")
        .select("id, name")
        .eq("merchant_id", account.merchant_id);

    const storeIds = (stores ?? []).map((store) => store.id);
    const storeNameMap = new Map((stores ?? []).map((store) => [store.id, store.name]));

    const { data: orders, error } = await supabase
        .schema("fm")
        .from("external_orders")
        .select("id, store_id, provider, external_order_id, order_state, ordered_at, total_amount, synced_at")
        .in("store_id", storeIds.length > 0 ? storeIds : ["00000000-0000-0000-0000-000000000000"])
        .order("ordered_at", { ascending: false })
        .limit(100);

    if (error) {
        throw new Error(error.message);
    }

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold">외부 주문</h1>
                <p className="text-sm text-muted-foreground">
                    Google Sheets 등 외부 채널에서 들어온 주문 목록입니다.
                </p>
            </div>

            <div className="overflow-hidden rounded-xl border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 text-left">주문시각</th>
                            <th className="px-4 py-3 text-left">매장</th>
                            <th className="px-4 py-3 text-left">주문번호</th>
                            <th className="px-4 py-3 text-left">상태</th>
                            <th className="px-4 py-3 text-left">금액</th>
                            <th className="px-4 py-3 text-left">동기화시각</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(orders ?? []).map((order) => (
                            <tr key={order.id} className="border-t">
                                <td className="px-4 py-3">
                                    {new Date(order.ordered_at).toLocaleString("ko-KR")}
                                </td>
                                <td className="px-4 py-3">{storeNameMap.get(order.store_id) ?? "-"}</td>
                                <td className="px-4 py-3 font-mono text-xs">{order.external_order_id}</td>
                                <td className="px-4 py-3">{order.order_state}</td>
                                <td className="px-4 py-3">{order.total_amount ?? "-"}</td>
                                <td className="px-4 py-3">
                                    {new Date(order.synced_at).toLocaleString("ko-KR")}
                                </td>
                            </tr>
                        ))}

                        {(orders ?? []).length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                    동기화된 외부 주문이 없습니다.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>
        </div>
    );
}