import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials in backend environment variables");
}

// Global anonymous client for public routes
export const supabasePublic = createClient(supabaseUrl, supabaseKey);

// Function to create a client with user's JWT for request-level scoping
export function createSupabaseUserClient(userJwt: string) {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${userJwt}`,
      },
    },
  });
}
