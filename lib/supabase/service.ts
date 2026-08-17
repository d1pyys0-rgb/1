import { createClient } from "@supabase/supabase-js"

// Server-only client using the service role key. bunnylove uses a fully
// custom username/password auth system (no Supabase Auth), so all reads and
// writes to users/invites/download_file go through this client, bypassing
// RLS by design. NEVER import this file from a "use client" component.
export function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error("Missing Supabase service role environment variables")
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
