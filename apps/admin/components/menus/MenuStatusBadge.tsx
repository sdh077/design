export default function MenuStatusBadge({
    isActive,
}: {
    isActive: boolean;
}) {
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${isActive
                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border border-zinc-500/30 bg-zinc-500/10 text-zinc-300"
                }`}
        >
            {isActive ? "판매중" : "비활성"}
        </span>
    );
}