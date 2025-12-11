import { createClient } from '@supabase/supabase-js';

// Your external Supabase project credentials
const SUPABASE_URL = 'https://zlmblrhukeymtcmqbllt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsbWJscmh1a2V5bXRjbXFibGx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjcyNTcsImV4cCI6MjA2NTE0MzI1N30.a-rznxPKDJJeOF7SGnBXHCLLO31YnKLCBQYmL0HFNXY';

export const userSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
