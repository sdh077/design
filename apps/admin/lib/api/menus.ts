import { supabase } from "@/lib/supabase/client";
import type { Menu } from "@/lib/types/menu";

export async function getMenusByStoreId(storeId: string): Promise<Menu[]> {
    const { data, error } = await supabase
        .from("menus")
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("[getMenusByStoreId]", error);
        throw new Error("메뉴 목록을 불러오지 못했습니다.");
    }

    return (data ?? []) as Menu[];
}