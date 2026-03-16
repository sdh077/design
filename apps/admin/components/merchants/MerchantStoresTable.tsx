import Link from "next/link";
import type { Store } from "@/lib/types/store";

interface MerchantStoresTableProps {
    stores: Store[];
}

export default function MerchantStoresTable({
    stores,
}: MerchantStoresTableProps) {
    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="min-w-full text-sm">
                <thead className="bg-muted/40 text-left text-muted-foreground">
                    <tr className="border-b border-border">
                        <th className="px-4 py-3 font-medium">매장명</th>
                        <th className="px-4 py-3 font-medium">코드</th>
                        <th className="px-4 py-3 font-medium">연락처</th>
                        <th className="px-4 py-3 font-medium">주소</th>
                        <th className="px-4 py-3 font-medium">상태</th>
                    </tr>
                </thead>

                <tbody>
                    {stores.map((store) => (
                        <tr
                            key={store.id}
                            className="border-b border-border/70 last:border-b-0 hover:bg-muted/30"
                        >
                            <td className="px-4 py-3 font-medium text-foreground">
                                <Link
                                    href={`/stores/${store.id}`}
                                    className="hover:text-blue-400"
                                >
                                    {store.name}
                                </Link>
                            </td>

                            <td className="px-4 py-3 text-muted-foreground">
                                {store.code ?? "-"}
                            </td>

                            <td className="px-4 py-3 text-muted-foreground">
                                {store.phone ?? "-"}
                            </td>

                            <td className="px-4 py-3 text-muted-foreground">
                                {store.address ?? "-"}
                            </td>

                            <td className="px-4 py-3 text-muted-foreground">
                                {store.status}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}