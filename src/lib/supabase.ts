import { createClient } from '@supabase/supabase-js';

// Busca as chaves do arquivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cria a conexão única para usar no site todo
export const supabase = createClient(supabaseUrl, supabaseKey);