import { redirect } from "next/navigation";
import { PageHeader } from "@workspace/ui";
import { createClient } from "@/lib/supabase/server";
import { getAccessibleStores } from "@/lib/store/get-accessible-stores";
import { ExternalOrdersClient } from "@/components/external-orders/external-orders-client";

type StoreRow = {
    id: string;
    name: string;
};

type ExternalOrderRow = {
    id: string;
    store_id: string;
    provider: string;
    external_order_id: string;
    order_state: string;
    ordered_at: string;
    completed_at: string | null;
    cancelled_at: string | null;
    total_amount: number | null;
    raw_json: unknown;
    synced_at: string;
    created_at: string;
    updated_at: string;
};

type MenuListRow = {
    id: string;
    store_id: string;
    name: string;
    is_active: boolean;
    updated_at: string;
};

type MappingRow = {
    menu_id: string;
    external_catalog_item_id: string;
    external_catalog_items: {
        id: string;
        title: string;
        external_item_id: string;
        code: string | null;
    } | null;
};

type RecipeRow = {
    menu_id: string;
};

export default async function ExternalOrdersPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const stores = (await getAccessibleStores()) as StoreRow[];
    const storeIds = stores.map((store) => store.id);

    let orders: ExternalOrderRow[] = [];
    let menus: MenuListRow[] = [];
    let mappings: MappingRow[] = [];
    let recipes: RecipeRow[] = [];

    if (storeIds.length > 0) {
        const [
            { data: orderData, error: orderError },
            { data: menuData, error: menuError },
        ] = await Promise.all([
            supabase
                .from("external_orders")
                .select("*")
                .in("store_id", storeIds)
                .order("ordered_at", { ascending: false }),
            supabase
                .from("menus")
                .select("id, store_id, name, is_active, updated_at")
                .in("store_id", storeIds)
                .order("name", { ascending: true }),
        ]);

        if (orderError) {
            throw new Error(orderError.message);
        }

        if (menuError) {
            throw new Error(menuError.message);
        }

        orders = (orderData ?? []) as ExternalOrderRow[];
        menus = (menuData ?? []) as MenuListRow[];

        const menuIds = menus.map((menu) => menu.id);

        if (menuIds.length > 0) {
            const [
                { data: mappingData, error: mappingError },
                { data: recipeData, error: recipeError },
            ] = await Promise.all([
                supabase
                    .from("menu_external_item_maps")
                    .select(`
            menu_id,
            external_catalog_item_id,
            external_catalog_items (
              id,
              title,
              external_item_id,
              code
            )
          `)
                    .in("menu_id", menuIds),
                supabase.from("recipes").select("menu_id").in("menu_id", menuIds),
            ]);

            if (mappingError) {
                throw new Error(mappingError.message);
            }

            if (recipeError) {
                throw new Error(recipeError.message);
            }

            mappings = (mappingData ?? []) as unknown as MappingRow[];
            recipes = (recipeData ?? []) as RecipeRow[];
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="외부 주문"
                description="POS 주문과 내 메뉴 연동 상태를 함께 확인합니다."
            />

            <ExternalOrdersClient
                stores={stores}
                initialOrders={orders}
                initialMenus={menus}
                initialMappings={mappings}
                initialRecipes={recipes}
            />
        </div>
    );
}