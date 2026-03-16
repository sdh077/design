import { createClient } from "@/lib/supabase/server";

export async function getUserWorkspaceIds() {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return [];
    }

    const { data, error } = await supabase
        .from("memberships")
        .select("workspace_id")
        .eq("user_id", user.id);

    if (error) {
        console.error("[getUserWorkspaceIds]", error);
        return [];
    }

    return [...new Set((data ?? []).map((item) => item.workspace_id))];
}