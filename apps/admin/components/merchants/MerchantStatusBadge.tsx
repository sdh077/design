import type { MerchantStatus } from "@/lib/types/merchant";

const statusLabelMap: Record<MerchantStatus, string> = {
    ACTIVE: "운영중",
    PENDING: "승인대기",
    INACTIVE: "중지",
};

const statusClassMap: Record<MerchantStatus, string> = {
    ACTIVE:
        "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    PENDING:
        "border border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    INACTIVE: "border border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
};

export default function MerchantStatusBadge({
    status,
}: {
    status: MerchantStatus;
}) {
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClassMap[status]}`}
        >
            {statusLabelMap[status]}
        </span>
    );
}