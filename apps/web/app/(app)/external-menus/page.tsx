import { redirect } from "next/navigation";
import { PageHeader } from "@workspace/ui";
import { createClient } from "@/lib/supabase/server";
import { getAccessibleStores } from "@/lib/store/get-accessible-stores";
import { ExternalMenusClient } from "@/components/external-menus/external-menus-client";

export default async function ExternalMenusPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const stores = await getAccessibleStores();

    return (
        <div className="space-y-6">
            <PageHeader
                title="외부 메뉴"
                description="POS에서 동기화한 외부 카탈로그 메뉴를 확인합니다."
            />

            <ExternalMenusClient
                stores={stores as { id: string; name: string }[]}
            />
        </div>
    );
}