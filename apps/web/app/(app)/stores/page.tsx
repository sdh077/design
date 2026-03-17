import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageHeader,
} from "@workspace/ui";
import { CreateStoreForm } from "./store-form";
import { createClient } from "@/lib/supabase/server";
import { getAccessibleStores } from "@/lib/store/get-accessible-stores";
import { getCurrentMerchantAccount } from "@/lib/auth/get-user-merchant";
import { requireUser } from "@/lib/auth/require-user";

export default async function StoresPage() {
  const { supabase } = await requireUser()

  const [account, stores] = await Promise.all([
    getCurrentMerchantAccount(),
    getAccessibleStores(),
  ]);

  if (!account?.merchant_id) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="매장 관리"
          description="가맹점 계정 정보가 연결되지 않았습니다."
        />
      </div>
    );
  }

  const { data: merchant, error: merchantError } = await supabase
    .from("merchants")
    .select("id, name")
    .eq("id", account.merchant_id)
    .maybeSingle();

  if (merchantError) {
    throw new Error(merchantError.message);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="매장 관리"
        description="내 가맹점에 속한 매장만 표시됩니다."
      />

      <Card>
        <CardHeader>
          <CardTitle>매장 생성</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateStoreForm merchant={merchant} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>매장 목록</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stores.map((store) => (
            <div
              key={store.id}
              className="rounded-xl border border-border p-4"
            >
              <div className="font-medium">{store.name}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                code: {store.code ?? "-"} / timezone: {store.timezone}
              </div>
            </div>
          ))}

          {!stores.length ? (
            <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              접근 가능한 매장이 없습니다.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}