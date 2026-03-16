"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Option {
    value: string;
    label: string;
}

interface CreateStoreFormProps {
    workspaces: Option[];
    merchants: Option[];
}

export default function CreateStoreForm({
    workspaces,
    merchants,
}: CreateStoreFormProps) {
    const router = useRouter();

    const [isOpen, setIsOpen] = useState(false);
    const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.value ?? "");
    const [merchantId, setMerchantId] = useState("");
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [timezone, setTimezone] = useState("Asia/Seoul");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [status, setStatus] = useState("ACTIVE");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/stores", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    workspace_id: workspaceId,
                    merchant_id: merchantId || null,
                    name,
                    code,
                    timezone,
                    address,
                    phone,
                    status,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message ?? "매장 생성에 실패했습니다.");
            }

            setIsOpen(false);
            setWorkspaceId(workspaces[0]?.value ?? "");
            setMerchantId("");
            setName("");
            setCode("");
            setTimezone("Asia/Seoul");
            setAddress("");
            setPhone("");
            setStatus("ACTIVE");
            router.refresh();
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
                {isOpen ? "닫기" : "매장 추가"}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-6">
                    <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-foreground">매장 추가</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                워크스페이스와 가맹점을 선택해 새 매장을 등록합니다.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="space-y-2">
                                    <span className="text-sm text-muted-foreground">워크스페이스</span>
                                    <select
                                        value={workspaceId}
                                        onChange={(e) => setWorkspaceId(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                                        required
                                    >
                                        {workspaces.map((workspace) => (
                                            <option key={workspace.value} value={workspace.value}>
                                                {workspace.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="space-y-2">
                                    <span className="text-sm text-muted-foreground">가맹점</span>
                                    <select
                                        value={merchantId}
                                        onChange={(e) => setMerchantId(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                                    >
                                        <option value="">미지정</option>
                                        {merchants.map((merchant) => (
                                            <option key={merchant.value} value={merchant.value}>
                                                {merchant.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="space-y-2">
                                    <span className="text-sm text-muted-foreground">매장명</span>
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                                        placeholder="예: 성수 2호점"
                                        required
                                    />
                                </label>

                                <label className="space-y-2">
                                    <span className="text-sm text-muted-foreground">매장 코드</span>
                                    <input
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                                        placeholder="예: SS002"
                                    />
                                </label>

                                <label className="space-y-2">
                                    <span className="text-sm text-muted-foreground">타임존</span>
                                    <input
                                        value={timezone}
                                        onChange={(e) => setTimezone(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                                        required
                                    />
                                </label>

                                <label className="space-y-2">
                                    <span className="text-sm text-muted-foreground">상태</span>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                                    >
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="PENDING">PENDING</option>
                                        <option value="INACTIVE">INACTIVE</option>
                                    </select>
                                </label>
                            </div>

                            <label className="block space-y-2">
                                <span className="text-sm text-muted-foreground">주소</span>
                                <input
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                                    placeholder="서울 성동구 ..."
                                />
                            </label>

                            <label className="block space-y-2">
                                <span className="text-sm text-muted-foreground">연락처</span>
                                <input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                                    placeholder="02-123-4567"
                                />
                            </label>

                            {errorMessage && (
                                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                                    {errorMessage}
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-lg border border-border px-4 py-2 text-sm text-foreground"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                                >
                                    {isSubmitting ? "생성 중..." : "생성"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}