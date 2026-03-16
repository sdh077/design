import AccountTable from "@/components/accounts/AccountTable";
import CreateAccountForm from "@/components/accounts/CreateAccountForm";
import { getMerchantAccounts } from "@/lib/api/merchant-accounts";
import { getMerchants } from "@/lib/api/merchants";
import { getWorkspaces } from "@/lib/api/workspaces";

export default async function AccountsPage() {
    const [accounts, merchants, workspaces] = await Promise.all([
        getMerchantAccounts(),
        getMerchants(),
        getWorkspaces(),
    ]);

    const merchantMap = new Map(
        merchants.map((merchant) => [merchant.id, merchant.name])
    );

    const rows = accounts.map((account) => ({
        ...account,
        merchantName: merchantMap.get(account.merchant_id) ?? null,
    }));

    const activeCount = accounts.filter(
        (account) => account.status === "ACTIVE"
    ).length;

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">계정 관리</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        가맹점 관리자 계정을 관리합니다.
                    </p>
                </div>

                <CreateAccountForm
                    merchants={merchants.map((merchant) => ({
                        value: merchant.id,
                        label: merchant.name,
                    }))}
                    workspaces={workspaces.map((workspace) => ({
                        value: workspace.id,
                        label: workspace.name,
                    }))}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card p-5">
                    <p className="text-sm text-muted-foreground">전체 계정</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                        {accounts.length}
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                    <p className="text-sm text-muted-foreground">활성 계정</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                        {activeCount}
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                    <p className="text-sm text-muted-foreground">가맹점 수</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                        {merchants.length}
                    </p>
                </div>
            </div>

            <AccountTable accounts={rows} />
        </div>
    );
}