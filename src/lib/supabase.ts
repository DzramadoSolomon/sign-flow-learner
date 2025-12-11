import { createClient } from '@supabase/supabase-js';

// Your external Supabase project credentials
const SUPABASE_URL = 'https://zlmblrhukeymtcmqbllt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsbWJscmh1a2V5bXRjbXFibGx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0Nzk2NjEsImV4cCI6MjA4MTA1NTY2MX0.PumkTQDl3aCKCeF4CMXpxoKQ8MeGtJdFVI-M51nyA90';

export const userSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
