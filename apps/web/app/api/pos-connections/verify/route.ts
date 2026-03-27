import { NextRequest, NextResponse } from "next/server";

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

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const merchantId = String(body?.merchantId ?? "").trim();
        const accessKey = String(body?.accessKey ?? "").trim();
        const secretKey = String(body?.secretKey ?? "").trim();

        if (!merchantId || !accessKey || !secretKey) {
            return NextResponse.json(
                {
                    ok: false,
                    message: "merchantId, accessKey, secretKey를 모두 입력해주세요.",
                },
                { status: 400 }
            );
        }

        const url = `https://open-api.tossplace.com/api-public/openapi/v1/merchants/${merchantId}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-access-key": accessKey,
                "x-secret-key": secretKey,
            },
            cache: "no-store",
        });

        const eventId = response.headers.get("x-toss-event-id");
        const rateLimitRemaining = response.headers.get("x-ratelimit-remaining");
        const rateLimitReset = response.headers.get("x-ratelimit-reset");

        let json: TossMerchantResponse | null = null;

        try {
            json = (await response.json()) as TossMerchantResponse;
        } catch {
            json = null;
        }

        if (!response.ok) {
            const reason =
                json &&
                    "resultType" in json &&
                    json.resultType === "FAIL" &&
                    json.error?.reason
                    ? json.error.reason
                    : `토스플레이스 검증 실패 (HTTP ${response.status})`;

            return NextResponse.json(
                {
                    ok: false,
                    message: reason,
                    status: response.status,
                    eventId,
                    rateLimitRemaining,
                    rateLimitReset,
                },
                { status: response.status }
            );
        }

        if (!json || json.resultType !== "SUCCESS") {
            return NextResponse.json(
                {
                    ok: false,
                    message: "토스플레이스 응답 형식이 예상과 다릅니다.",
                    eventId,
                },
                { status: 502 }
            );
        }

        return NextResponse.json({
            ok: true,
            merchant: {
                id: json.success.id,
                name: json.success.name,
                businessNumber: json.success.businessNumber,
            },
            eventId,
            rateLimitRemaining,
            rateLimitReset,
        });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "알 수 없는 오류가 발생했습니다.",
            },
            { status: 500 }
        );
    }
}