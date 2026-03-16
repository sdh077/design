import type { MerchantAccountRole } from "@/lib/types/merchant-account";

const roleLabelMap: Record<MerchantAccountRole, string> = {
    OWNER: "오너",
    MANAGER: "매니저",
    STAFF: "스태프",
};

const roleClassMap: Record<MerchantAccountRole, string> = {
    OWNER: "border border-sky-500/30 bg-sky-500/10 text-sky-300",
    MANAGER: "border border-violet-500/30 bg-violet-500/10 text-violet-300",
    STAFF: "border border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
};

export default function MerchantAccountRoleBadge({
    role,
}: {
    role: MerchantAccountRole;
}) {
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${roleClassMap[role]}`}
        >
            {roleLabelMap[role]}
        </span>
    );
}