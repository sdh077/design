import Link from "next/link";
import type { Store } from "@/lib/types/store";

interface StoreTableRow extends Store {
    merchantName: string | null;
    workspaceName?: string | null;
}

interface StoreTableProps {
    stores: StoreTableRow[];
}

export default function StoreTable({ stores }: StoreTableProps) {
    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="min-w-full text-sm">
                <thead className="bg-muted/40 text-left text-muted-foreground">
                    <tr className="border-b border-border">
                        <th className="px-4 py-3 font-medium">매장명</th>
                        <th className="px-4 py-3 font-medium">가맹점</th>
                        <th className="px-4 py-3 font-medium">코드</th>
                        <th className="px-4 py-3 font-medium">연락처</th>
                        <th className="px-4 py-3 font-medium">상태</th>
                    </tr>
                </thead>
                <tbody>
                    {stores.map((store) => (
                        <tr
                            key={store.id}
                            className="border-b border-border/70 last:border-b-0"
                        >
                            <td className="px-4 py-3 font-medium text-foreground">
                                <Link href={`/stores/${store.id}`} className="hover:text-blue-400">
                                    {store.name}
                                </Link>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                                {store.merchantName ?? "-"}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                                {store.code ?? "-"}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                                {store.phone ?? "-"}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                                {store.status ?? "-"}
                            </td>
                        </tr>
                    ))}

                    {stores.length === 0 && (
                        <tr>
                            <td
                                colSpan={5}
                                className="px-4 py-10 text-center text-muted-foreground"
                            >
                                등록된 매장이 없습니다.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}