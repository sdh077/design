import { supabase } from "@/lib/supabase/client";
import type { MerchantAccount } from "@/lib/types/merchant-account";

export async function getMerchantAccountsByMerchantId(
    merchantId: string
): Promise<MerchantAccount[]> {
    const { data, error } = await supabase
        .from("merchant_accounts")
        .select("*")
        .eq("merchant_id", merchantId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[getMerchantAccountsByMerchantId]", error);
        throw new Error("가맹점 계정 목록을 불러오지 못했습니다.");
    }

    return (data ?? []) as MerchantAccount[];
}

export async function getMerchantAccounts(): Promise<MerchantAccount[]> {
    const { data, error } = await supabase
        .from("merchant_accounts")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[getMerchantAccounts]", error);
        throw new Error("계정 목록을 불러오지 못했습니다.");
    }

    return (data ?? []) as MerchantAccount[];
}