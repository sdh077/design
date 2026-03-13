"use client";

import { useState } from "react";
import { Button, Input } from "@workspace/ui";

type StoreOption = {
    id: string;
    name: string;
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
    const [loading, setLoading] = useState(false);

    const onSubmit = async () => {
        try {
            setLoading(true);

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
                throw new Error(json.message ?? "POS 연결 실패");
            }

            window.location.reload();
        } catch (error) {
            alert(error instanceof Error ? error.message : "POS 연결 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-3">
            <select
                className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-600"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
            >
                {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                        {store.name}
                    </option>
                ))}
            </select>

            <Input
                placeholder="merchantId"
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
            />

            <Input
                placeholder="accessKey"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
            />

            <Input
                placeholder="secretKey"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
            />

            <Button
                onClick={onSubmit}
                disabled={loading || !storeId || !merchantId || !accessKey || !secretKey}
            >
                {loading ? "등록 중..." : "POS 연결 등록"}
            </Button>
        </div>
    );
}