import { createClient } from "@/lib/supabase/server";

export async function getCurrentMerchantAccount() {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return null;
    }

    const { data, error } = await supabase
        .from("merchant_accounts")
        .select("*")
        .eq("auth_user_id", user.id)
        .maybeSingle();

    if (error) {
        console.error("[getCurrentMerchantAccount]", error);
        return null;
    }

    return data;
}