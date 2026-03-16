import Link from "next/link";
import { notFound } from "next/navigation";
import MenuTable from "@/components/menus/MenuTable";
import { getMerchantById } from "@/lib/api/merchants";
import { getMenusByStoreId } from "@/lib/api/menus";
import { getStoreById } from "@/lib/api/stores";

interface StoreDetailPageProps {
    params: Promise<{
        storeId: string;
    }>;
}

export default async function StoreDetailPage({
    params,
}: StoreDetailPageProps) {
    const { storeId } = await params;

    const store = await getStoreById(storeId);

    if (!store) {
        notFound();
    }

    const [merchant, menus] = await Promise.all([
        getMerchantById(store.merchant_id),
        getMenusByStoreId(storeId),
    ]);

    const activeMenuCount = menus.filter((menu) => menu.is_active).length;

    return (
        <div className="space-y-6">
            <div className="mb-2">
                <Link
                    href={`/merchants/${store.merchant_id}`}
                    className="text-sm text-muted-foreground hover:text-foreground"
                >
                    ← 가맹점으로 돌아가기
                </Link>
            </div>

            <div>
                <h1 className="text-2xl font-bold text-foreground">{store.name}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    매장 기본 정보와 메뉴 현황을 확인합니다.
                </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <p className="text-sm text-muted-foreground">매장명</p>
                        <p className="mt-1 text-base font-medium text-foreground">
                            {store.name}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">가맹점</p>
                        <p className="mt-1 text-base font-medium text-foreground">
                            {merchant?.name ?? "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">매장 코드</p>
                        <p className="mt-1 text-base font-medium text-foreground">
                            {store.code ?? "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">타임존</p>
                        <p className="mt-1 text-base font-medium text-foreground">
                            {store.timezone}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">상태</p>
                        <p className="mt-1 text-base font-medium text-foreground">
                            {store.status ?? "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">연락처</p>
                        <p className="mt-1 text-base font-medium text-foreground">
                            {store.phone ?? "-"}
                        </p>
                    </div>

                    <div className="md:col-span-2">
                        <p className="text-sm text-muted-foreground">주소</p>
                        <p className="mt-1 text-base font-medium text-foreground">
                            {store.address ?? "-"}
                        </p>
                    </div>
                </div>
            </div>

            <section className="space-y-4">
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">메뉴 관리</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            이 매장에 등록된 메뉴 목록입니다.
                        </p>
                    </div>

                    <div className="flex gap-3 text-sm text-muted-foreground">
                        <span>전체 {menus.length}개</span>
                        <span>판매중 {activeMenuCount}개</span>
                    </div>
                </div>

                <MenuTable menus={menus} />
            </section>
        </div>
    );
}