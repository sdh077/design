import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            merchant_id,
            name,
            code,
            timezone,
            address,
            phone,
            status,
        } = body as {
            merchant_id?: string;
            name?: string;
            code?: string;
            timezone?: string;
            address?: string;
            phone?: string;
            status?: string;
        };

        if (!merchant_id || !name || !timezone) {
            return NextResponse.json(
                { message: "merchant_id, name, timezone은 필수입니다." },
                { status: 400 }
            );
        }

        const payload = {
            merchant_id,
            name,
            code: code || null,
            timezone,
            address: address || null,
            phone: phone || null,
            status: status || "ACTIVE",
            workspace_id: null,
        };

        const { data, error } = await supabaseAdmin
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