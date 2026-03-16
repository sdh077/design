import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui";
import { LoginForm } from "./login-form";

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ next?: string }>;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { next } = await searchParams;

    if (user) {
        redirect(next || "/dashboard");
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader>
                        <CardTitle>로그인</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <LoginForm next={next || "/dashboard"} />
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}