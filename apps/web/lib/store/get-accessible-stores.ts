import { createClient } from "@/lib/supabase/server";
import { getUserWorkspaceIds } from "@/lib/auth/get-user-workspaces";

export async function getAccessibleStores() {
    const supabase = await createClient();
    const workspaceIds = await getUserWorkspaceIds();

    if (workspaceIds.length === 0) {
        return [];
    }

    const { data, error } = await supabase
        .from("stores")
        .select("*")
        .in("workspace_id", workspaceIds)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[getAccessibleStores]", error);
        throw new Error("매장 목록을 불러오지 못했습니다.");
    }

    return data ?? [];
}