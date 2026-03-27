import { Card, CardContent, CardHeader, CardTitle, PageHeader } from "@workspace/ui";
import { getAccessibleStores } from "@/lib/store/get-accessible-stores";
import { RecipesClient } from "@/components/recipes/recipes-client";

export default async function RecipesPage() {
    const stores = await getAccessibleStores();

    return (
        <div className="space-y-6">
            <PageHeader
                title="레시피 관리"
                description="지점별 메뉴 레시피를 간단하게 입력하고 저장합니다."
            />

            <Card>
                <CardHeader>
                    <CardTitle>레시피 관리</CardTitle>
                </CardHeader>
                <CardContent>
                    <RecipesClient
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