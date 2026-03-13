import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const storeId = String(body.storeId ?? "");
        const provider = "TOSS_PLACE";
        const merchantId = String(body.merchantId ?? "").trim();
        const accessKey = String(body.accessKey ?? "").trim();
        const secretKey = String(body.secretKey ?? "").trim();

        if (!storeId || !merchantId || !accessKey || !secretKey) {
            return NextResponse.json(
                { ok: false, message: "storeId, merchantId, accessKey, secretKey are required" },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("pos_connections")
            .insert({
                store_id: storeId,
                provider,
                merchant_id: merchantId,
                access_key: accessKey,
                secret_key: secretKey,
                is_active: true,
            })
            .select("*")
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({
            ok: true,
            connection: data,
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