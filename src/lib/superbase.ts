import { createClient } from "@supabase/supabase-js";

const superbaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const superbaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(
  superbaseUrl,
  superbaseAnonKey, // Use this as visitor key for read access
);