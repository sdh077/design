import { createAdminClient } from "@/lib/supabase/admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageHeader,
} from "@workspace/ui";
import { CreateMenuForm } from "./create-menu-form";
import {
  MenuMappingTable,
  type MenuMappingRow,
  type MenuOption,
} from "./menu-mapping-table";

export default async function MenusPage() {
  const supabase = createAdminClient();

  const [
    { data: stores, error: storesError },
    { data: menus, error: menusError },
    { data: externalItems, error: externalItemsError },
    { data: mappings, error: mappingsError },
  ] = await Promise.all([
    supabase
      .from("stores")
      .select("id, name")
      .order("created_at", { ascending: false }),

    supabase
      .from("menus")
      .select("id, store_id, name, is_active, created_at")
      .order("created_at", { ascending: false }),

    supabase
      .from("external_catalog_items")
      .select("id, store_id, title, code, provider, created_at")
      .order("created_at", { ascending: false }),

    supabase
      .from("menu_external_item_maps")
      .select("id, menu_id, external_catalog_item_id, created_at"),
  ]);

  if (storesError) throw new Error(storesError.message);
  if (menusError) throw new Error(menusError.message);
  if (externalItemsError) throw new Error(externalItemsError.message);
  if (mappingsError) throw new Error(mappingsError.message);

  const safeStores = stores ?? [];
  const safeMenus = menus ?? [];
  const safeExternalItems = externalItems ?? [];
  const safeMappings = mappings ?? [];

  const menuById = new Map(
    safeMenus.map((menu) => [
      String(menu.id),
      {
        id: String(menu.id),
        name: String(menu.name),
        store_id: String(menu.store_id),
      },
    ])
  );

  const mappingByExternalId = new Map<
    string,
    {
      id: string;
      menuId: string;
      menuName: string;
    }
  >(
    safeMappings.flatMap((mapping) => {
      const menu = menuById.get(String(mapping.menu_id));

      if (!menu) return [];

      return [
        [
          String(mapping.external_catalog_item_id),
          {
            id: String(mapping.id),
            menuId: String(mapping.menu_id),
            menuName: String(menu.name),
          },
        ],
      ];
    })
  );

  const menuOptions: MenuOption[] = safeMenus.map((menu) => ({
    id: String(menu.id),
    name: String(menu.name),
    store_id: String(menu.store_id),
  }));

  const rows: MenuMappingRow[] = safeExternalItems.map((item) => ({
    id: String(item.id),
    storeId: String(item.store_id),
    title: String(item.title ?? ""),
    code: item.code ?? null,
    provider: String(item.provider ?? "TOSS_PLACE"),
    mappedMenu: mappingByExternalId.get(String(item.id)) ?? null,
  }));

  return (
    <div>
      <PageHeader
        title="메뉴"
        description="외부 상품을 내부 메뉴로 표준화하고 매핑한다."
      />

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>내부 메뉴 생성</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateMenuForm stores={safeStores} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>외부 상품 매핑</CardTitle>
          </CardHeader>
          <CardContent>
            <MenuMappingTable rows={rows} menuOptions={menuOptions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}