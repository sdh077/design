import Link from "next/link";
import type { Merchant } from "@/lib/types/merchant";
import MerchantStatusBadge from "./MerchantStatusBadge";

interface MerchantWithStoreCount extends Merchant {
    storeCount: number;
}

interface MerchantTableProps {
    merchants: MerchantWithStoreCount[];
}

export default function MerchantTable({ merchants }: MerchantTableProps) {
    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="min-w-full text-sm">
                <thead className="bg-muted/40 text-left text-muted-foreground">
                    <tr className="border-b border-border">
                        <th className="px-4 py-3 font-medium">가맹점명</th>
                        <th className="px-4 py-3 font-medium">대표자명</th>
                        <th className="px-4 py-3 font-medium">사업자번호</th>
                        <th className="px-4 py-3 font-medium">매장 수</th>
                        <th className="px-4 py-3 font-medium">상태</th>
                        <th className="px-4 py-3 font-medium">상세</th>
                    </tr>
                </thead>
                <tbody>
                    {merchants.map((merchant) => (
                        <tr
                            key={merchant.id}
                            className="border-b border-border/70 last:border-b-0"
                        >
                            <td className="px-4 py-3 font-medium text-foreground">
                                {merchant.name}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                                {merchant.owner_name ?? "-"}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                                {merchant.business_number}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                                {merchant.storeCount}
                            </td>
                            <td className="px-4 py-3">
                                <MerchantStatusBadge status={merchant.status} />
                            </td>
                            <td className="px-4 py-3">
                                <Link
                                    href={`/merchants/${merchant.id}`}
                                    className="text-sm font-medium text-blue-400 hover:text-blue-300"
                                >
                                    보기
                                </Link>
                            </td>
                        </tr>
                    ))}

                    {merchants.length === 0 && (
                        <tr>
                            <td
                                colSpan={6}
                                className="px-4 py-10 text-center text-muted-foreground"
                            >
                                등록된 가맹점이 없습니다.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}