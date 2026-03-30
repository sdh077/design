type Txn = {
  inventory_item_id: string;
  type: string;
  quantity: number;
};

function getSignedQuantity(type: string, quantity: number) {
  if (type === "OUT" || type === "WASTE") return -quantity;
  return quantity;
}

export function calculateStockMap(txns: Txn[]) {
  const map = new Map<string, number>();

  for (const txn of txns) {
    const id = String(txn.inventory_item_id);
    const qty = Number(txn.quantity ?? 0);
    const signed = getSignedQuantity(txn.type, qty);

    map.set(id, (map.get(id) ?? 0) + signed);
  }

  return map;
}