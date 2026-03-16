import Link from "next/link";
import { notFound } from "next/navigation";
import MerchantStatusBadge from "@/components/merchants/MerchantStatusBadge";
import MerchantStoresTable from "@/components/merchants/MerchantStoresTable";
import MerchantAccountsTable from "@/components/merchants/MerchantAccountsTable";
import { getMerchantById } from "@/lib/api/merchants";
import { getStoresByMerchantId } from "@/lib/api/stores";
import { getMerchantAccountsByMerchantId } from "@/lib/api/merchant-accounts";

interface MerchantDetailPageProps {
    params: Promise<{
        merchantId: string;
    }>;
}

export default async function MerchantDetailPage({
    params,
}: MerchantDetailPageProps) {
    const { merchantId } = await params;

    const merchant = await getMerchantById(merchantId);

    if (!merchant) {
        notFound();
    }

    const [stores, accounts] = await Promise.all([
        getStoresByMerchantId(merchantId),
        getMerchantAccountsByMerchantId(merchantId),
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="mb-2">
                        <Link
                            href="/merchants"
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            ← 목록으로
                        </Link>
                    </div>

                    <h1 className="text-2xl font-bold text-foreground">
                        {merchant.name}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        가맹점 기본 정보와 소속 매장을 확인합니다.
                    </p>
                </div>

                <MerchantStatusBadge status={merchant.status} />
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <p className="text-sm text-muted-foreground">가맹점명</p>
                        <p className="mt-1 text-base font-medium text-foreground">
                            {merchant.name}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">대표자명</p>
                        <p className="mt-1 text-base font-medium text-foreground">
                            {merchant.owner_name ?? "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">사업자번호</p>
                        <p className="mt-1 text-base font-medium text-foreground">
                            {merchant.business_number}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">연락처</p>
                        <p className="mt-1 text-base font-medium text-foreground">
                            {merchant.phone ?? "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">상태</p>
                        <div className="mt-1">
                            <MerchantStatusBadge status={merchant.status} />
                        </div>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">가입일</p>
                        <p className="mt-1 text-base font-medium text-foreground">
                            {new Date(merchant.created_at).toLocaleDateString("ko-KR")}
                        </p>
                    </div>
                </div>
            </div>

            <section className="space-y-4">
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">매장 목록</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            이 가맹점에 연결된 매장들이다.
                        </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        총 {stores.length}개
                    </div>
                </div>

                <MerchantStoresTable stores={stores} />
            </section>

            <section className="space-y-4">
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">계정 목록</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            이 가맹점에 연결된 관리자 계정들이다.
                        </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        총 {accounts.length}명
                    </div>
                </div>

                <MerchantAccountsTable accounts={accounts} />
            </section>
        </div>
    );
}