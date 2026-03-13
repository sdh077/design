import { createAdminClient } from "@/lib/supabase/admin";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    PageHeader,
} from "@workspace/ui";
import { CreateRecipeForm } from "./create-recipe-form";
import { RecipeLineManager } from "./recipe-line-manager";

export default async function RecipesPage() {
    const supabase = createAdminClient();

    const [
        { data: menus, error: menusError },
        { data: recipes, error: recipesError },
        { data: inventoryItems, error: inventoryItemsError },
        { data: recipeLines, error: recipeLinesError },
    ] = await Promise.all([
        supabase
            .from("menus")
            .select("id, store_id, name")
            .order("created_at", { ascending: false }),

        supabase
            .from("recipes")
            .select("id, menu_id, name, version, is_active, created_at")
            .order("created_at", { ascending: false }),

        supabase
            .from("inventory_items")
            .select("id, store_id, name, base_unit")
            .order("created_at", { ascending: false }),

        supabase
            .from("recipe_lines")
            .select("id, recipe_id, inventory_item_id, quantity, unit, created_at")
            .order("created_at", { ascending: false }),
    ]);

    if (menusError) throw new Error(menusError.message);
    if (recipesError) throw new Error(recipesError.message);
    if (inventoryItemsError) throw new Error(inventoryItemsError.message);
    if (recipeLinesError) throw new Error(recipeLinesError.message);

    const safeMenus = menus ?? [];
    const safeRecipes = recipes ?? [];
    const safeInventoryItems = inventoryItems ?? [];
    const safeRecipeLines = recipeLines ?? [];

    const menuById = new Map(
        safeMenus.map((menu) => [
            String(menu.id),
            {
                id: String(menu.id),
                store_id: String(menu.store_id),
                name: String(menu.name),
            },
        ])
    );

    const inventoryById = new Map(
        safeInventoryItems.map((item) => [
            String(item.id),
            {
                id: String(item.id),
                store_id: String(item.store_id),
                name: String(item.name),
                base_unit: String(item.base_unit),
            },
        ])
    );

    const recipeCards = safeRecipes.map((recipe) => {
        const menu = menuById.get(String(recipe.menu_id));

        const lines = safeRecipeLines
            .filter((line) => String(line.recipe_id) === String(recipe.id))
            .map((line) => {
                const inventory = inventoryById.get(String(line.inventory_item_id));

                return {
                    id: String(line.id),
                    inventoryItemId: String(line.inventory_item_id),
                    inventoryItemName: inventory?.name ?? "알 수 없음",
                    quantity: Number(line.quantity),
                    unit: String(line.unit),
                };
            });

        const availableInventoryItems = safeInventoryItems
            .filter((item) => String(item.store_id) === (menu?.store_id ?? ""))
            .map((item) => ({
                id: String(item.id),
                name: String(item.name),
                base_unit: String(item.base_unit),
            }));

        return {
            id: String(recipe.id),
            name: String(recipe.name),
            version: Number(recipe.version),
            menuName: menu?.name ?? "알 수 없음",
            menuId: String(recipe.menu_id),
            inventoryOptions: availableInventoryItems,
            lines,
        };
    });

    return (
        <div>
            <PageHeader
                title="레시피"
                description="내부 메뉴별 소모 재고를 정의한다."
            />

            <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
                <Card>
                    <CardHeader>
                        <CardTitle>레시피 생성</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CreateRecipeForm menus={safeMenus.map((menu) => ({
                            id: String(menu.id),
                            name: String(menu.name),
                        }))} />
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {recipeCards.map((recipe) => (
                        <RecipeLineManager
                            key={recipe.id}
                            recipe={recipe}
                        />
                    ))}

                    {!recipeCards.length ? (
                        <Card>
                            <CardContent className="p-6 text-sm text-zinc-500">
                                아직 레시피가 없다.
                            </CardContent>
                        </Card>
                    ) : null}
                </div>
            </div>
        </div>
    );
}