import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageHeader,
} from "@workspace/ui";
import { createClient } from "@/lib/supabase/server";
import { getAccessibleStores } from "@/lib/store/get-accessible-stores";
import { CreateInventoryItemForm } from "./create-inventory-item-form";
import { requireUser } from "@/lib/auth/require-user";

export default async function InventoryPage() {
  await requireUser();
  const stores = await getAccessibleStores();
  const storeIds = stores.map((store) => store.id);

  let inventoryItems: {
    id: string;
    store_id: string;
    name: string;
    base_unit: string;
    safety_stock: number;
    is_active: boolean;
    created_at: string;
  }[] = [];

  if (storeIds.length > 0) {
    const { data, error } = await supabase
      .from("inventory_items")
      .select("id, store_id, name, base_unit, safety_stock, is_active, created_at")
      .in("store_id", storeIds)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    inventoryItems = data ?? [];
  }

  const storeNameById = new Map(
    stores.map((store) => [String(store.id), String(store.name)])
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="재고 현황"
        description="내 가맹점에 속한 매장의 재고 품목만 표시됩니다."
      />

      <Card>
        <CardHeader>
          <CardTitle>재고 품목 생성</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateInventoryItemForm stores={stores} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>재고 품목 목록</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {inventoryItems.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border p-4"
            >
              <div className="font-medium">{item.name}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                매장: {storeNameById.get(String(item.store_id)) ?? "-"}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                기준 단위: {item.base_unit} / 안전재고: {item.safety_stock}
              </div>
            </div>
          ))}

          {!inventoryItems.length ? (
            <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              아직 재고 품목이 없습니다.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}