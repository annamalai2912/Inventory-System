import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const rawUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string) ||
  '';

const rawKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) ||
  '';

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawUrl.startsWith('https://') &&
  !rawUrl.includes('your_supabase_project') &&
  rawKey &&
  !rawKey.includes('your_supabase_anon_key')
);

const validUrl = isSupabaseConfigured ? rawUrl : 'https://rsmlbuloavsqphyendgb.supabase.co';
const validKey = isSupabaseConfigured ? rawKey : 'sb_publishable_xIzSBtd3M4h5GgGJF7-bPw_R_EkIGcV';

export const supabase = createClient<Database>(validUrl, validKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});
