import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Workspace } from "@/lib/types/workspace";

export async function getWorkspaceById(
    workspaceId: string
): Promise<Workspace | null> {
    const { data, error } = await supabaseAdmin
        .from("workspaces")
        .select("*")
        .eq("id", workspaceId)
        .maybeSingle();

    if (error) {
        console.error("[getWorkspaceById]", error);
        throw new Error("워크스페이스 정보를 불러오지 못했습니다.");
    }

    return (data as Workspace | null) ?? null;
}

export async function getWorkspaces(): Promise<Workspace[]> {
    const { data, error } = await supabaseAdmin
        .from("workspaces")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[getWorkspaces]", error);
        throw new Error("워크스페이스 목록을 불러오지 못했습니다.");
    }

    return (data ?? []) as Workspace[];
}