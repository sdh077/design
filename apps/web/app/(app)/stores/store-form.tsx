"use client";

import { useState } from "react";
import { Button, Input } from "@workspace/ui";

type MerchantOption = {
    id: string;
    name: string;
} | null;

interface CreateStoreFormProps {
    merchant: MerchantOption;
}

export function CreateStoreForm({ merchant }: CreateStoreFormProps) {
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [timezone, setTimezone] = useState("Asia/Seoul");
    const [loading, setLoading] = useState(false);

    const onSubmit = async () => {
        try {
            if (!merchant?.id) {
                throw new Error("가맹점 정보가 없습니다.");
            }

            setLoading(true);

            const res = await fetch("/api/stores", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    merchant_id: merchant.id,
                    name,
                    code,
                    timezone,
                }),
            });

            const json = await res.json();

            if (!res.ok || !json.ok) {
                throw new Error(json.message ?? "매장 생성 실패");
            }

            window.location.reload();
        } catch (error) {
            alert(error instanceof Error ? error.message : "매장 생성 실패");
        } finally {
            setLoading(false);
        }
    };

    if (!merchant) {
        return (
            <div className="rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">
                가맹점 정보가 없어 매장을 생성할 수 없습니다.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="rounded-xl border border-border bg-background/50 p-3">
                <div className="text-sm text-muted-foreground">가맹점</div>
                <div className="mt-1 font-medium text-foreground">{merchant.name}</div>
            </div>

            <Input
                placeholder="매장명"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <Input
                placeholder="매장 코드"
                value={code}
                onChange={(e) => setCode(e.target.value)}
            />

            <Input
                placeholder="타임존"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
            />

            <Button
                onClick={onSubmit}
                disabled={loading || !merchant?.id || !name.trim()}
            >
                {loading ? "생성 중..." : "매장 생성"}
            </Button>
        </div>
    );
}