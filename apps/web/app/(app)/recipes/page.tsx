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
import { CreateRecipeForm } from "./create-recipe-form";
import { RecipeLineManager } from "./recipe-line-manager";

type Recipe = {
    id: string;
    store_id: string;
    menu_id: string;
    created_at: string;
};

type Menu = {
    id: string;
    store_id: string;
    name: string;
    is_active: boolean;
};

export default async function RecipesPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const stores = await getAccessibleStores();
    const storeIds = stores.map((store) => store.id);

    let recipes: Recipe[] = [];
    let menus: Menu[] = [];

    if (storeIds.length > 0) {
        const [
            { data: recipesData, error: recipesError },
            { data: menusData, error: menusError },
        ] = await Promise.all([
            supabase
                .from("recipes")
                .select("*")
                .in("store_id", storeIds)
                .order("created_at", { ascending: false }),
            supabase
                .from("menus")
                .select("id, store_id, name, is_active")
                .in("store_id", storeIds)
                .order("created_at", { ascending: false }),
        ]);

        if (recipesError) throw new Error(recipesError.message);
        if (menusError) throw new Error(menusError.message);

        recipes = (recipesData ?? []) as Recipe[];
        menus = (menusData ?? []) as Menu[];
    }

    const menuById = new Map(menus.map((menu) => [menu.id, menu]));
    const storeNameById = new Map(
        stores.map((store) => [String(store.id), String(store.name)])
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title="레시피 관리"
                description="내 가맹점 매장의 레시피만 관리합니다."
            />

            <Card>
                <CardHeader>
                    <CardTitle>레시피 생성</CardTitle>
                </CardHeader>
                <CardContent>
                    <CreateRecipeForm stores={stores} menus={menus} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>레시피 목록</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {recipes.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                            등록된 레시피가 없습니다.
                        </div>
                    ) : (
                        recipes.map((recipe) => {
                            const menu = menuById.get(recipe.menu_id);

                            return (
                                <div
                                    key={recipe.id}
                                    className="rounded-xl border border-border p-4"
                                >
                                    <div className="font-medium">
                                        {menu?.name ?? "연결된 메뉴 없음"}
                                    </div>
                                    <div className="mt-1 text-sm text-muted-foreground">
                                        매장: {storeNameById.get(String(recipe.store_id)) ?? "-"}
                                    </div>

                                    <div className="mt-4">
                                        <RecipeLineManager
                                            recipeId={recipe.id}
                                            storeId={recipe.store_id}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>
        </div>
    );
}