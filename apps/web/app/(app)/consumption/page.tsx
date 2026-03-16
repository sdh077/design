import { redirect } from "next/navigation";
import { PageHeader } from "@workspace/ui";
import { createClient } from "@/lib/supabase/server";
import { getAccessibleStores } from "@/lib/store/get-accessible-stores";
import { ConsumptionClient } from "./consumption-client";

export default async function ConsumptionPage() {
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
        title="소모량 조회"
        description="내 가맹점 매장 기준으로 예상 소모량과 실제 사용량을 비교합니다."
      />

      <ConsumptionClient stores={stores} />
    </div>
  );
}