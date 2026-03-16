import { createAdminClient } from "@/lib/supabase/admin";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    PageHeader,
} from "@workspace/ui";
import { RecipeCalibrationClient } from "./recipe-calibration-client";

export default async function RecipeCalibrationPage() {
    const supabase = createAdminClient();

    const { data: stores, error } = await supabase
        .from("stores")
        .select("id, name")
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return (
        <div>
            <PageHeader
                title="레시피 보정"
                description="예상 소모량과 실제 사용량 차이를 기반으로 레시피 수량 보정값을 제안한다."
            />

            <Card>
                <CardHeader>
                    <CardTitle>보정 제안 조회</CardTitle>
                </CardHeader>
                <CardContent>
                    <RecipeCalibrationClient stores={stores ?? []} />
                </CardContent>
            </Card>
        </div>
    );
}