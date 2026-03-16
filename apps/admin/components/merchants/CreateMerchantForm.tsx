"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateMerchantForm() {
    const router = useRouter();

    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [ownerName, setOwnerName] = useState("");
    const [businessNumber, setBusinessNumber] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("ACTIVE");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/merchants", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    owner_name: ownerName,
                    business_number: businessNumber,
                    phone,
                    email,
                    status,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message ?? "가맹점 생성에 실패했습니다.");
            }

            setIsOpen(false);
            setName("");
            setOwnerName("");
            setBusinessNumber("");
            setPhone("");
            setEmail("");
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
                {isOpen ? "닫기" : "가맹점 추가"}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-6">
                    <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-foreground">가맹점 추가</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                가맹점 기본 정보를 등록합니다.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="space-y-2">
                                    <span className="text-sm text-muted-foreground">가맹점명</span>
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                                        placeholder="예: 성수 브루 카페"
                                        required
                                    />
                                </label>

                                <label className="space-y-2">
                                    <span className="text-sm text-muted-foreground">대표자명</span>
                                    <input
                                        value={ownerName}
                                        onChange={(e) => setOwnerName(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                                        placeholder="예: 김민수"
                                        required
                                    />
                                </label>

                                <label className="space-y-2">
                                    <span className="text-sm text-muted-foreground">사업자번호</span>
                                    <input
                                        value={businessNumber}
                                        onChange={(e) => setBusinessNumber(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                                        placeholder="123-45-67890"
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

                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="space-y-2">
                                    <span className="text-sm text-muted-foreground">연락처</span>
                                    <input
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                                        placeholder="010-1234-5678"
                                    />
                                </label>

                                <label className="space-y-2">
                                    <span className="text-sm text-muted-foreground">이메일</span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                                        placeholder="owner@example.com"
                                    />
                                </label>
                            </div>

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