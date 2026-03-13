import { Card, CardContent, CardHeader, CardTitle, PageHeader } from "@workspace/ui";

export default function InventoryPage() {
  return (
    <div>
      <PageHeader
        title="재고"
        description="재고 품목과 원장을 다음 단계에서 추가한다."
      />

      <Card>
        <CardHeader>
          <CardTitle>준비 중</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-zinc-400">
          inventory_items, inventory_txns 설계를 이어서 붙인다.
        </CardContent>
      </Card>
    </div>
  );
}