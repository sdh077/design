import { supabase } from "@/lib/supabase/client";
import type { Merchant } from "@/lib/types/merchant";

export async function getMerchants(): Promise<Merchant[]> {
    const { data, error } = await supabase
        .from("merchants")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[getMerchants]", error);
        throw new Error("가맹점 목록을 불러오지 못했습니다.");
    }

    return (data ?? []) as Merchant[];
}

export async function getMerchantById(
    merchantId: string
): Promise<Merchant | null> {
    const { data, error } = await supabase
        .from("merchants")
        .select("*")
        .eq("id", merchantId)
        .maybeSingle();

    if (error) {
        console.error("[getMerchantById]", error);
        throw new Error("가맹점 정보를 불러오지 못했습니다.");
    }

    return (data as Merchant | null) ?? null;
}