import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

// The secret key bypasses RLS, so only import this from route handlers and server components.
// Created on first use so missing env vars fail the request (and its fallback) instead of the import
export const getSupabase = () => {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;
    if (!url || !secretKey) throw new Error("SUPABASE_URL or SUPABASE_SECRET_KEY is not set");

    client = createClient(url, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
};
