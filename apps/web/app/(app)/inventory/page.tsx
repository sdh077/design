import { createAdminClient } from "@/lib/supabase/admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageHeader,
} from "@workspace/ui";
import { CreateInventoryItemForm } from "./create-inventory-item-form";

export default async function InventoryPage() {
  const supabase = createAdminClient();

  const [
    { data: stores, error: storesError },
    { data: inventoryItems, error: inventoryItemsError },
  ] = await Promise.all([
    supabase.from("stores").select("id, name").order("created_at", { ascending: false }),
    supabase
      .from("inventory_items")
      .select("id, store_id, name, base_unit, safety_stock, is_active, created_at")
      .order("created_at", { ascending: false }),
  ]);

  if (storesError) throw new Error(storesError.message);
  if (inventoryItemsError) throw new Error(inventoryItemsError.message);

  const storeNameById = new Map(
    (stores ?? []).map((store) => [String(store.id), String(store.name)])
  );

  return (
    <div>
      <PageHeader
        title="재고"
        description="원재료와 소모품 기준 품목을 생성하고 관리한다."
      />

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>재고 품목 생성</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateInventoryItemForm stores={stores ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>재고 품목 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(inventoryItems ?? []).map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <div className="font-medium text-zinc-100">{item.name}</div>
                  <div className="mt-1 text-sm text-zinc-400">
                    매장: {storeNameById.get(String(item.store_id)) ?? "-"}
                  </div>
                  <div className="mt-1 text-sm text-zinc-400">
                    기준 단위: {item.base_unit} / 안전재고: {item.safety_stock}
                  </div>
                </div>
              ))}

              {!inventoryItems?.length ? (
                <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
                  아직 재고 품목이 없다.
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}