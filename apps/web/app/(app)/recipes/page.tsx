import { Card, CardContent, CardHeader, CardTitle, PageHeader } from "@workspace/ui";
import { requireUser } from "@/lib/auth/require-user";
import { getAccessibleStores } from "@/lib/store/get-accessible-stores";
import { RecipesSimpleEditor } from "@/components/recipes/recipes-simple-editor";

type MenuRow = {
    id: string;
    name: string;
    is_active: boolean;
};

type InventoryItemRow = {
    id: string;
    name: string;
    base_unit: string;
    is_active: boolean;
};

type RecipeRow = {
    id: string;
    menu_id: string;
    name: string | null;
};

type RecipeLineRow = {
    id: string;
    recipe_id: string;
    inventory_item_id: string;
    quantity: number;
    unit: string;
};

export default async function RecipesPage() {
    const { supabase } = await requireUser();
    const stores = await getAccessibleStores();
    const defaultStore = stores[0];

    if (!defaultStore) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="레시피 관리"
                    description="매장을 먼저 생성해야 레시피를 관리할 수 있습니다."
                />
            </div>
        );
    }

    const storeId = String(defaultStore.id);

    const [{ data: menus, error: menusError }, { data: inventoryItems, error: inventoryError }] =
        await Promise.all([
            supabase
                .from("menus")
                .select("id, name, is_active")
                .eq("store_id", storeId)
                .order("name", { ascending: true }),
            supabase
                .from("inventory_items")
                .select("id, name, base_unit, is_active")
                .eq("store_id", storeId)
                .eq("is_active", true)
                .order("name", { ascending: true }),
        ]);

    if (menusError) throw new Error(menusError.message);
    if (inventoryError) throw new Error(inventoryError.message);

    const menuIds = (menus ?? []).map((m) => m.id);

    let recipes: RecipeRow[] = [];
    let recipeLines: RecipeLineRow[] = [];

    if (menuIds.length > 0) {
        const { data: recipeData, error: recipeError } = await supabase
            .from("recipes")
            .select("id, menu_id, name")
            .in("menu_id", menuIds);

        if (recipeError) throw new Error(recipeError.message);
        recipes = (recipeData ?? []) as RecipeRow[];

        const recipeIds = recipes.map((r) => r.id);

        if (recipeIds.length > 0) {
            const { data: lineData, error: lineError } = await supabase
                .from("recipe_lines")
                .select("id, recipe_id, inventory_item_id, quantity, unit")
                .in("recipe_id", recipeIds);

            if (lineError) throw new Error(lineError.message);
            recipeLines = (lineData ?? []) as RecipeLineRow[];
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="레시피 관리"
                description="메뉴별 사용 재료를 빠르게 입력하고 저장합니다."
            />

            <Card>
                <CardHeader>
                    <CardTitle>{String(defaultStore.name)} 레시피</CardTitle>
                </CardHeader>
                <CardContent>
                    <RecipesSimpleEditor
                        storeId={storeId}
                        menus={(menus ?? []) as MenuRow[]}
                        inventoryItems={(inventoryItems ?? []) as InventoryItemRow[]}
                        recipes={recipes}
                        recipeLines={recipeLines}
                    />
                </CardContent>
            </Card>
        </div>
    );
}