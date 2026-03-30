import { redirect } from "next/navigation";
import { PageHeader } from "@workspace/ui";
import { createClient } from "@/lib/supabase/server";
import { getAccessibleStores } from "@/lib/store/get-accessible-stores";
import { InventorySnapshotsClient } from "@/components/inventory-snapshots/inventory-snapshots-client";

export default async function InventorySnapshotsPage() {
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
                title="재고 스냅샷"
                description="특정 시점의 실제 재고를 저장합니다."
            />

            <InventorySnapshotsClient stores={stores as { id: string; name: string }[]} />
        </div>
    );
}