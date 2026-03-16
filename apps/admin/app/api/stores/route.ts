import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            workspace_id,
            merchant_id,
            name,
            code,
            timezone,
            address,
            phone,
            status,
        } = body;

        if (!workspace_id || !name || !timezone) {
            return NextResponse.json(
                { message: "workspace_id, name, timezone은 필수입니다." },
                { status: 400 }
            );
        }

        const payload = {
            workspace_id,
            merchant_id: merchant_id || null,
            name,
            code: code || null,
            timezone,
            address: address || null,
            phone: phone || null,
            status: status || "ACTIVE",
        };

        const { data, error } = await supabase
            .from("stores")
            .insert(payload)
            .select("*")
            .single();

        if (error) {
            console.error("[POST /api/stores]", error);
            return NextResponse.json(
                { message: "매장 생성에 실패했습니다." },
                { status: 500 }
            );
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error("[POST /api/stores]", error);
        return NextResponse.json(
            { message: "잘못된 요청입니다." },
            { status: 400 }
        );
    }
}