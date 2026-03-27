import { NextRequest, NextResponse } from "next/server";
// 네 프로젝트에서 쓰는 admin client / auth 유틸에 맞게 수정
import { createAdminClient } from "@/lib/supabase/admin";

type TossMerchantResponse =
    | {
        resultType: "SUCCESS";
        success: {
            id: number;
            name: string;
            businessNumber: string;
        };
    }
    | {
        resultType: "FAIL";
        error?: {
            errorCode?: string;
            reason?: string;
            data?: unknown;
        };
    };

async function verifyTossMerchant(params: {
    merchantId: string;
    accessKey: string;
    secretKey: string;
}) {
    const { merchantId, accessKey, secretKey } = params;

    const response = await fetch(
        `https://open-api.tossplace.com/api-public/openapi/v1/merchants/${merchantId}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-access-key": accessKey,
                "x-secret-key": secretKey,
            },
            cache: "no-store",
        }
    );

    const eventId = response.headers.get("x-toss-event-id");

    let json: TossMerchantResponse | null = null;
    try {
        json = (await response.json()) as TossMerchantResponse;
    } catch {
        json = null;
    }

    if (!response.ok || !json || json.resultType !== "SUCCESS") {
        const reason =
            json &&
                "resultType" in json &&
                json.resultType === "FAIL" &&
                json.error?.reason
                ? json.error.reason
                : `토스플레이스 검증 실패 (HTTP ${response.status})`;

        throw new Error(eventId ? `${reason} [eventId=${eventId}]` : reason);
    }

    return {
        merchant: json.success,
        eventId,
    };
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const storeId = String(body?.storeId ?? "").trim();
        const merchantId = String(body?.merchantId ?? "").trim();
        const accessKey = String(body?.accessKey ?? "").trim();
        const secretKey = String(body?.secretKey ?? "").trim();

        if (!storeId || !merchantId || !accessKey || !secretKey) {
            return NextResponse.json(
                { ok: false, message: "필수값이 누락되었습니다." },
                { status: 400 }
            );
        }

        const verified = await verifyTossMerchant({
            merchantId,
            accessKey,
            secretKey,
        });

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("pos_connections")
            .insert({
                store_id: storeId,
                provider: "tossplace",
                merchant_id: merchantId,
                access_key: accessKey,
                secret_key: secretKey,
                is_active: true,
                metadata: {
                    verifiedMerchantName: verified.merchant.name,
                    verifiedBusinessNumber: verified.merchant.businessNumber,
                    verifiedAt: new Date().toISOString(),
                    verifyEventId: verified.eventId,
                },
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({
            ok: true,
            item: data,
            verifiedMerchant: verified.merchant,
        });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message:
                    error instanceof Error ? error.message : "등록 중 오류가 발생했습니다.",
            },
            { status: 500 }
        );
    }
}