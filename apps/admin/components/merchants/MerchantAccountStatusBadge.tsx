import type { MerchantAccountStatus } from "@/lib/types/merchant-account";

const statusLabelMap: Record<MerchantAccountStatus, string> = {
    ACTIVE: "활성",
    PENDING: "대기",
    INACTIVE: "비활성",
};

const statusClassMap: Record<MerchantAccountStatus, string> = {
    ACTIVE:
        "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    PENDING:
        "border border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    INACTIVE: "border border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
};

export default function MerchantAccountStatusBadge({
    status,
}: {
    status: MerchantAccountStatus;
}) {
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClassMap[status]}`}
        >
            {statusLabelMap[status]}
        </span>
    );
}