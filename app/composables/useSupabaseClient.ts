import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserSupabaseClient: SupabaseClient | null = null;

export function useSupabaseClient() {
  const config = useRuntimeConfig();

  if (import.meta.client) {
    if (!browserSupabaseClient) {
      browserSupabaseClient = createClient(
        config.public.supabaseUrl,
        config.public.supabaseKey,
      );
    }

    return browserSupabaseClient;
  }

  return createClient(config.public.supabaseUrl, config.public.supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
