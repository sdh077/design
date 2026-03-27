"use client";

import { useMemo, useState } from "react";
import { Button, Input } from "@workspace/ui";

type StoreOption = {
    id: string;
    name: string;
};

type VerifyResult =
    | {
        ok: true;
        merchant: {
            id: number;
            name: string;
            businessNumber: string;
        };
        eventId?: string | null;
        rateLimitRemaining?: string | null;
        rateLimitReset?: string | null;
    }
    | {
        ok: false;
        message: string;
        eventId?: string | null;
        rateLimitRemaining?: string | null;
        rateLimitReset?: string | null;
    };

export function CreatePosConnectionForm({
    stores,
}: {
    stores: StoreOption[];
}) {
    const [storeId, setStoreId] = useState(stores[0]?.id ?? "");
    const [merchantId, setMerchantId] = useState("");
    const [accessKey, setAccessKey] = useState("");
    const [secretKey, setSecretKey] = useState("");

    const [verifying, setVerifying] = useState(false);
    const [saving, setSaving] = useState(false);
    const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);

    const canVerify = useMemo(() => {
        return Boolean(merchantId.trim() && accessKey.trim() && secretKey.trim());
    }, [merchantId, accessKey, secretKey]);

    const isVerified = verifyResult?.ok === true;

    const resetVerify = () => {
        setVerifyResult(null);
    };

    const onVerify = async () => {
        try {
            setVerifying(true);
            setVerifyResult(null);

            const res = await fetch("/api/pos-connections/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    merchantId,
                    accessKey,
                    secretKey,
                }),
            });

            const json = (await res.json()) as VerifyResult;

            setVerifyResult(json);
        } catch (error) {
            setVerifyResult({
                ok: false,
                message:
                    error instanceof Error ? error.message : "연결 테스트에 실패했습니다.",
            });
        } finally {
            setVerifying(false);
        }
    };

    const onSubmit = async () => {
        try {
            setSaving(true);

            const res = await fetch("/api/pos-connections", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    storeId,
                    merchantId,
                    accessKey,
                    secretKey,
                }),
            });

            const json = await res.json();

            if (!res.ok || !json.ok) {
                throw new Error(json.message ?? "POS 연결 등록 실패");
            }

            window.location.reload();
        } catch (error) {
            alert(error instanceof Error ? error.message : "등록 실패");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">매장</label>
                <select
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                    {stores.map((store) => (
                        <option key={store.id} value={store.id}>
                            {store.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Merchant ID</label>
                <Input
                    value={merchantId}
                    onChange={(e) => {
                        setMerchantId(e.target.value);
                        resetVerify();
                    }}
                    placeholder="예: 123456"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Access Key</label>
                <Input
                    value={accessKey}
                    onChange={(e) => {
                        setAccessKey(e.target.value);
                        resetVerify();
                    }}
                    placeholder="Access Key"
                />
            </div>

            <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Secret Key</label>
                <Input
                    type="password"
                    value={secretKey}
                    onChange={(e) => {
                        setSecretKey(e.target.value);
                        resetVerify();
                    }}
                    placeholder="Secret Key"
                />
            </div>

            <div className="md:col-span-2 flex flex-wrap gap-2">
                <Button
                    type="button"
                    onClick={onVerify}
                    disabled={!canVerify || verifying}
                    variant="outline"
                >
                    {verifying ? "연결 테스트 중..." : "연결 테스트"}
                </Button>

                <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={!storeId || !isVerified || saving}
                >
                    {saving ? "등록 중..." : "검증 후 등록"}
                </Button>
            </div>

            {verifyResult && (
                <div className="md:col-span-2">
                    {verifyResult.ok ? (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm">
                            <p className="font-semibold text-green-700">연결 성공</p>
                            <p className="mt-1">매장명: {verifyResult.merchant.name}</p>
                            <p>사업자번호: {verifyResult.merchant.businessNumber}</p>
                            <p>Merchant ID: {verifyResult.merchant.id}</p>
                            {verifyResult.eventId ? (
                                <p className="mt-1 text-xs text-green-700/80">
                                    eventId: {verifyResult.eventId}
                                </p>
                            ) : null}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
                            <p className="font-semibold text-red-700">연결 실패</p>
                            <p className="mt-1">{verifyResult.message}</p>
                            {verifyResult.eventId ? (
                                <p className="mt-1 text-xs text-red-700/80">
                                    eventId: {verifyResult.eventId}
                                </p>
                            ) : null}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}