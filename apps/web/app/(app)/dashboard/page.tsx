import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle, PageHeader, StatCard } from "@workspace/ui";

export default async function DashboardPage() {
    const supabase = createAdminClient();

    const [{ count: storeCount }, { count: posCount }, { count: catalogCount }, { count: orderCount }] =
        await Promise.all([
            supabase.from("stores").select("*", { count: "exact", head: true }),
            supabase.from("pos_connections").select("*", { count: "exact", head: true }),
            supabase.from("external_catalog_items").select("*", { count: "exact", head: true }),
            supabase.from("external_orders").select("*", { count: "exact", head: true }),
        ]);

    return (
        <div>
            <PageHeader
                title="대시보드"
                description="매장, POS 연결, 주문 동기화 현황을 한눈에 확인한다."
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard title="매장 수" value={String(storeCount ?? 0)} />
                <StatCard title="POS 연결 수" value={String(posCount ?? 0)} />
                <StatCard title="카탈로그 적재 수" value={String(catalogCount ?? 0)} />
                <StatCard title="주문 적재 수" value={String(orderCount ?? 0)} />
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>다음 단계</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-zinc-400">
                        <p>1. 매장 생성</p>
                        <p>2. POS 연결 등록</p>
                        <p>3. 카탈로그/주문 동기화</p>
                        <p>4. 메뉴 매핑과 재고 설계</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>현재 상태</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-zinc-400">
                        <p>커스텀 스키마 `fm` 사용 중</p>
                        <p>Supabase admin client 연결 완료</p>
                        <p>모노레포 UI 패키지 적용 완료</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}