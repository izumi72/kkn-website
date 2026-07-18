import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://odmlezelkynubrvqwwpa.supabase.co';
const supabaseAnonKey = 'sb_publishable_ayOjUVrVaATE6PP03pE62A_2OEqLrgn';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);