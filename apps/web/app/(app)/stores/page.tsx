import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle, PageHeader } from "@workspace/ui";
import { CreateStoreForm } from "./store-form";

export default async function StoresPage() {
  const supabase = createAdminClient();

  const { data: workspaces, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id, name")
    .order("created_at", { ascending: false });

  if (workspaceError) {
    throw new Error(workspaceError.message);
  }

  const { data: stores, error: storeError } = await supabase
    .from("stores")
    .select("id, name, code, timezone, created_at")
    .order("created_at", { ascending: false });

  if (storeError) {
    throw new Error(storeError.message);
  }

  return (
    <div>
      <PageHeader
        title="매장 관리"
        description="워크스페이스에 속한 매장을 생성하고 관리한다."
      />

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>매장 생성</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateStoreForm workspaces={workspaces ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>매장 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stores?.map((store) => (
                <div
                  key={store.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <div className="font-medium text-zinc-100">{store.name}</div>
                  <div className="mt-1 text-sm text-zinc-400">
                    code: {store.code ?? "-"} / timezone: {store.timezone}
                  </div>
                </div>
              ))}

              {!stores?.length ? (
                <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
                  아직 매장이 없다.
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}