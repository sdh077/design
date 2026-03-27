import { Card, CardContent, CardHeader, CardTitle, PageHeader } from "@workspace/ui";
import { getAccessibleStores } from "@/lib/store/get-accessible-stores";
import { MenusClient } from "@/components/menus/menus-client";

export default async function MenusPage() {
  const stores = await getAccessibleStores();

  return (
    <div className="space-y-6">
      <PageHeader
        title="메뉴 관리"
        description="지점별 메뉴를 검색하고 빠르게 수정합니다."
      />

      <Card>
        <CardHeader>
          <CardTitle>메뉴 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <MenusClient
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