import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (typeof window === "undefined") {
  if (!supabaseUrl) {
    console.error("❌ CRITICAL: NEXT_PUBLIC_SUPABASE_URL is missing in environment!");
  }

  if (!supabaseServiceKey) {
    console.error(
      "❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing in server environment! RLS policies will block customer synchronization."
    );
  }
}

export const supabaseServer = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseServiceKey || "placeholder-service-key"
);
