import { Card, CardContent, CardHeader, CardTitle, PageHeader } from "@workspace/ui";
import { getAccessibleStores } from "@/lib/store/get-accessible-stores";
import { InventoryClient } from "@/components/inventory/inventory-client";

export default async function InventoryPage() {
  const stores = await getAccessibleStores();

  return (
    <div className="space-y-6">
      <PageHeader
        title="재고 관리"
        description="지점별 재고를 선택해서 관리합니다."
      />

      <Card>
        <CardHeader>
          <CardTitle>재고 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <InventoryClient
            stores={stores.map((store) => ({
              id: String(store.id),
              name: String(store.name),
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}