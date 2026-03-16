import CreateStoreForm from "@/components/stores/CreateStoreForm";
import StoreTable from "@/components/stores/StoreTable";
import { getMerchants } from "@/lib/api/merchants";
import { getStores } from "@/lib/api/stores";
import { getWorkspaceById, getWorkspaces } from "@/lib/api/workspaces";

export default async function StoresPage() {
    const [stores, merchants, workspaces] = await Promise.all([
        getStores(),
        getMerchants(),
        getWorkspaces(),
    ]);

    const merchantMap = new Map(
        merchants.map((merchant) => [merchant.id, merchant.name])
    );

    const workspaceMap = new Map(
        workspaces.map((workspace) => [workspace.id, workspace.name])
    );

    const rows = stores.map((store) => ({
        ...store,
        merchantName: store.merchant_id
            ? merchantMap.get(store.merchant_id) ?? null
            : null,
        workspaceName: workspaceMap.get(store.workspace_id) ?? null,
    }));

    const activeCount = stores.filter((store) => store.status === "ACTIVE").length;

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">매장 관리</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        전체 매장과 소속 정보를 관리합니다.
                    </p>
                </div>

                <CreateStoreForm
                    workspaces={workspaces.map((workspace) => ({
                        value: workspace.id,
                        label: workspace.name,
                    }))}
                    merchants={merchants.map((merchant) => ({
                        value: merchant.id,
                        label: merchant.name,
                    }))}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card p-5">
                    <p className="text-sm text-muted-foreground">전체 매장</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                        {stores.length}
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                    <p className="text-sm text-muted-foreground">운영중</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                        {activeCount}
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                    <p className="text-sm text-muted-foreground">워크스페이스 수</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                        {workspaces.length}
                    </p>
                </div>
            </div>

            <StoreTable stores={rows} />
        </div>
    );
}