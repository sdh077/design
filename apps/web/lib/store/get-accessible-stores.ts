import { createClient } from "@/lib/supabase/server";
import { getCurrentMerchantAccount } from "@/lib/auth/get-user-merchant";

export async function getAccessibleStores() {
    const supabase = await createClient();
    const account = await getCurrentMerchantAccount();

    if (!account?.merchant_id) {
        return [];
    }

    const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("merchant_id", account.merchant_id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[getAccessibleStores]", error);
        throw new Error("매장 목록을 불러오지 못했습니다.");
    }

    return data ?? [];
}