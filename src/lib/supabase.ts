import { createClient } from '@supabase/supabase-js';

// Your external Supabase project credentials
const SUPABASE_URL = 'https://zlmblrhukeymtcmqbllt.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_5FAKCpn3K_Y13DwP1LMFWg_-bS0kymJ';

export const userSupabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
