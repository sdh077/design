"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Option {
    value: string;
    label: string;
}

interface CreateAccountFormProps {
    merchants: Option[];
    workspaces: Option[];
}

export default function CreateAccountForm({
    merchants,
    workspaces,
}: CreateAccountFormProps) {
    const router = useRouter();

    const [isOpen, setIsOpen] = useState(false);
    const [merchantId, setMerchantId] = useState(merchants[0]?.value ?? "");
    const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.value ?? "");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("OWNER");
    const [status, setStatus] = useState("ACTIVE");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/accounts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    merchant_id: merchantId,
                    workspace_id: workspaceId,
                    name,
                    email,
                    password,
                    role,
                    status,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message ?? "계정 생성에 실패했습니다.");
            }

            setIsOpen(false);
            setMerchantId(merchants[0]?.value ?? "");
            setWorkspaceId(workspaces[0]?.value ?? "");
            setName("");
            setEmail("");
            setPassword("");
            setRole("OWNER");
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
                {isOpen ? "닫기" : "계정 추가"}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-6">
                    <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-foreground">계정 추가</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                로그인 가능한 계정과 가맹점 관리자 정보를 함께 생성합니다.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <label className="block space-y-2">
                                <span className="text-sm text-muted-foreground">가맹점</span>
                                <select
                                    value={merchantId}
                                    onChange={(e) => setMerchantId(e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                                    required
                                >
                                    {merchants.map((merchant) => (
                                        <option key={merchant.value} value={merchant.value}>
                                            {merchant.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="block space-y-2">
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

                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="space-y-2">
                                    <span className="text-sm text-muted-foreground">이름</span>
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                                        placeholder="홍길동"
                                        required
                                    />
                                </label>

                                <label className="space-y-2">
                                    <span className="text-sm text-muted-foreground">이메일</span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                                        placeholder="admin@example.com"
                                        required
                                    />
                                </label>

                                <label className="space-y-2">
                                    <span className="text-sm text-muted-foreground">비밀번호</span>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                                        placeholder="8자 이상 권장"
                                        required
                                    />
                                </label>

                                <label className="space-y-2">
                                    <span className="text-sm text-muted-foreground">권한</span>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                                    >
                                        <option value="OWNER">OWNER</option>
                                        <option value="MANAGER">MANAGER</option>
                                        <option value="STAFF">STAFF</option>
                                    </select>
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