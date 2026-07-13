import { createClient } from "@supabase/supabase-js";

// Server-only client using the service-role key: it bypasses RLS, so the
// tables stay locked to the outside world and every query here MUST be
// scoped to the authenticated user's id.
export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (see .env.local.example)",
    );
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
