import type { MerchantAccount } from "@/lib/types/merchant-account";
import MerchantAccountRoleBadge from "./MerchantAccountRoleBadge";
import MerchantAccountStatusBadge from "./MerchantAccountStatusBadge";

interface MerchantAccountsTableProps {
    accounts: MerchantAccount[];
}

export default function MerchantAccountsTable({
    accounts,
}: MerchantAccountsTableProps) {
    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="min-w-full text-sm">
                <thead className="bg-muted/40 text-left text-muted-foreground">
                    <tr className="border-b border-border">
                        <th className="px-4 py-3 font-medium">이름</th>
                        <th className="px-4 py-3 font-medium">이메일</th>
                        <th className="px-4 py-3 font-medium">권한</th>
                        <th className="px-4 py-3 font-medium">상태</th>
                        <th className="px-4 py-3 font-medium">생성일</th>
                    </tr>
                </thead>
                <tbody>
                    {accounts.map((account) => (
                        <tr
                            key={account.id}
                            className="border-b border-border/70 last:border-b-0"
                        >
                            <td className="px-4 py-3 font-medium text-foreground">
                                {account.name}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                                {account.email}
                            </td>
                            <td className="px-4 py-3">
                                <MerchantAccountRoleBadge role={account.role} />
                            </td>
                            <td className="px-4 py-3">
                                <MerchantAccountStatusBadge status={account.status} />
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                                {new Date(account.created_at).toLocaleDateString("ko-KR")}
                            </td>
                        </tr>
                    ))}

                    {accounts.length === 0 && (
                        <tr>
                            <td
                                colSpan={5}
                                className="px-4 py-10 text-center text-muted-foreground"
                            >
                                연결된 계정이 없습니다.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}