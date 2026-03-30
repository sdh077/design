import { redirect } from "next/navigation";
import { PageHeader } from "@workspace/ui";
import { createClient } from "@/lib/supabase/server";
import { getAccessibleStores } from "@/lib/store/get-accessible-stores";
import { ConsumptionIntervalAnalysisClient } from "@/components/consumption/consumption-interval-analysis-client";

export default async function ConsumptionAnalysisPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const stores = await getAccessibleStores();

    return (
        <div className="space-y-6">
            <PageHeader
                title="소모량 분석"
                description="스냅샷 구간 기준으로 예상 소모와 실제 소모를 비교합니다."
            />

            <ConsumptionIntervalAnalysisClient
                stores={stores as { id: string; name: string }[]}
            />
        </div>
    );
}