import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const workspaceId = String(body.workspaceId ?? "");
        const name = String(body.name ?? "").trim();
        const code = body.code ? String(body.code).trim() : null;
        const timezone = String(body.timezone ?? "Asia/Seoul");

        if (!workspaceId || !name) {
            return NextResponse.json(
                { ok: false, message: "workspaceId, name are required" },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("stores")
            .insert({
                workspace_id: workspaceId,
                name,
                code,
                timezone,
            })
            .select("*")
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({
            ok: true,
            store: data,
        });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : "unknown error",
            },
            { status: 500 }
        );
    }
}