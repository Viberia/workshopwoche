// lib/supabaseClient.js
"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// liest automatisch NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY
export const supabase = createClientComponentClient();
