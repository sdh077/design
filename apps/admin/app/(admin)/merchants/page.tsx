import CreateMerchantForm from "@/components/merchants/CreateMerchantForm";
import MerchantTable from "@/components/merchants/MerchantTable";
import { getMerchants } from "@/lib/api/merchants";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function MerchantsPage() {
    const merchants = await getMerchants();

    const { data: stores, error } = await supabaseAdmin
        .from("stores")
        .select("id, merchant_id");

    if (error) {
        console.error("[MerchantsPage:stores]", error);
        throw new Error("매장 정보를 불러오지 못했습니다.");
    }

    const storeCountMap = (stores ?? []).reduce<Record<string, number>>(
        (acc, store) => {
            if (!store.merchant_id) return acc;
            acc[store.merchant_id] = (acc[store.merchant_id] ?? 0) + 1;
            return acc;
        },
        {}
    );
    const merchantsWithStoreCount = merchants.map((merchant) => ({
        ...merchant,
        storeCount: storeCountMap[merchant.id] ?? 0,
    }));
    console.log(merchants, merchantsWithStoreCount)

    const activeCount = merchants.filter((item) => item.status === "ACTIVE").length;
    const pendingCount = merchants.filter((item) => item.status === "PENDING").length;

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">가맹점 관리</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        가맹점과 매장 운영 현황을 관리합니다.
                    </p>
                </div>

                <CreateMerchantForm />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card p-5">
                    <p className="text-sm text-muted-foreground">전체 가맹점</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                        {merchants.length}
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                    <p className="text-sm text-muted-foreground">운영중</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                        {activeCount}
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                    <p className="text-sm text-muted-foreground">승인대기</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                        {pendingCount}
                    </p>
                </div>
            </div>

            <MerchantTable merchants={merchantsWithStoreCount} />
        </div>
    );
}