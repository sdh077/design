import { Card, CardContent, CardHeader, CardTitle, PageHeader } from "@workspace/ui";
import { requireUser } from "@/lib/auth/require-user";
import { getAccessibleStores } from "@/lib/store/get-accessible-stores";
import { InventoryGrid, type InventoryGridRow } from "@/components/inventory/inventory-grid";

type InventoryItemRow = {
  id: string;
  store_id: string;
  name: string;
  base_unit: string;
  safety_stock: number;
  is_active: boolean;
};

type InventoryTxnRow = {
  inventory_item_id: string;
  type: string;
  quantity: number;
};

function getSignedQuantity(type: string, quantity: number) {
  if (type === "OUT" || type === "WASTE" || type === "ADJUST_OUT") {
    return -quantity;
  }
  return quantity;
}

export default async function InventoryPage() {
  const { supabase } = await requireUser();
  const stores = await getAccessibleStores();
  const defaultStore = stores[0];

  if (!defaultStore) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="재고 관리"
          description="매장을 먼저 생성해야 재고를 관리할 수 있습니다."
        />
      </div>
    );
  }

  const storeId = String(defaultStore.id);

  const { data: itemRows, error: itemError } = await supabase
    .from("inventory_items")
    .select("id, store_id, name, base_unit, safety_stock, is_active")
    .eq("store_id", storeId)
    .order("name", { ascending: true });

  if (itemError) {
    throw new Error(itemError.message);
  }

  const { data: txnRows, error: txnError } = await supabase
    .from("inventory_txns")
    .select("inventory_item_id, type, quantity")
    .eq("store_id", storeId);

  if (txnError) {
    throw new Error(txnError.message);
  }

  const stockMap = new Map<string, number>();

  for (const txn of (txnRows ?? []) as InventoryTxnRow[]) {
    const itemId = String(txn.inventory_item_id);
    const quantity = Number(txn.quantity ?? 0);
    const signed = getSignedQuantity(String(txn.type ?? ""), quantity);
    stockMap.set(itemId, (stockMap.get(itemId) ?? 0) + signed);
  }

  const initialRows: InventoryGridRow[] = ((itemRows ?? []) as InventoryItemRow[]).map(
    (row) => ({
      id: String(row.id),
      store_id: String(row.store_id),
      name: String(row.name),
      base_unit: String(row.base_unit),
      safety_stock: Number(row.safety_stock ?? 0),
      is_active: Boolean(row.is_active),
      current_stock: stockMap.get(String(row.id)) ?? 0,
    })
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="재고 관리"
        description="엑셀처럼 자유롭게 입력하고 저장 버튼으로 한 번에 반영합니다."
      />

      <Card>
        <CardHeader>
          <CardTitle>{String(defaultStore.name)} 재고</CardTitle>
        </CardHeader>
        <CardContent>
          <InventoryGrid
            storeId={storeId}
            storeName={String(defaultStore.name)}
            initialRows={initialRows}
          />
        </CardContent>
      </Card>
    </div>
  );
}