import { supabase } from "@/lib/supabase/client";
import type { Store } from "@/lib/types/store";

export async function getStoresByMerchantId(
    merchantId: string
): Promise<Store[]> {
    const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("merchant_id", merchantId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[getStoresByMerchantId]", error);
        throw new Error("매장 목록을 불러오지 못했습니다.");
    }

    return (data ?? []) as Store[];
}

export async function getStoreById(storeId: string): Promise<Store | null> {
    const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", storeId)
        .maybeSingle();

    if (error) {
        console.error("[getStoreById]", error);
        throw new Error("매장 정보를 불러오지 못했습니다.");
    }

    return (data as Store | null) ?? null;
}

export async function getStores(): Promise<Store[]> {
    const { data, error } = await supabase
        .from("stores")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[getStores]", error);
        throw new Error("매장 목록을 불러오지 못했습니다.");
    }

    return (data ?? []) as Store[];
}

