import "server-only";
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const schema = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA ?? "yeogayaji";

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: {
        schema,
      },
    }
  );
}

