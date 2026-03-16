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
import { CreateMenuForm } from "./create-menu-form";

type MenuRow = {
  id: string;
  store_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export default async function MenusPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const stores = await getAccessibleStores();
  const storeIds = stores.map((store) => store.id);

  let menus: MenuRow[] = [];

  if (storeIds.length > 0) {
    const { data, error } = await supabase
      .from("menus")
      .select("*")
      .in("store_id", storeIds)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    menus = (data ?? []) as MenuRow[];
  }

  const storeNameById = new Map(
    stores.map((store) => [String(store.id), String(store.name)])
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="메뉴 현황"
        description="내 가맹점 매장의 메뉴만 표시됩니다."
      />

      <Card>
        <CardHeader>
          <CardTitle>메뉴 생성</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateMenuForm stores={stores} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>메뉴 목록</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {menus.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              등록된 메뉴가 없습니다.
            </div>
          ) : (
            menus.map((menu) => (
              <div
                key={menu.id}
                className="rounded-xl border border-border p-4"
              >
                <div className="font-medium">{menu.name}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  매장: {storeNameById.get(String(menu.store_id)) ?? "-"}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  상태: {menu.is_active ? "판매중" : "비활성"}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}