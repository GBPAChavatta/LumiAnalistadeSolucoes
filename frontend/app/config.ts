export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
export const USE_SUPABASE_LEADS = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
