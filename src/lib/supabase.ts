import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://atwhorkmgeqwdtfdzatm.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_EttDf8Biw77OOV5V7l21Bw_hXk11sHS';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
