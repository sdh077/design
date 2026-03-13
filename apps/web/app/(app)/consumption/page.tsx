import { createAdminClient } from "@/lib/supabase/admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageHeader,
} from "@workspace/ui";
import { ConsumptionClient } from "./consumption-client";

export default async function ConsumptionPage() {
  const supabase = createAdminClient();

  const { data: stores, error } = await supabase
    .from("stores")
    .select("id, name")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div>
      <PageHeader
        title="소모량"
        description="주문, 메뉴 매핑, 레시피 기준으로 예상 원재료 소모량을 계산한다."
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>소모량 조회</CardTitle>
          </CardHeader>
          <CardContent>
            <ConsumptionClient stores={stores ?? []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}