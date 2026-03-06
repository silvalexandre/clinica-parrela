const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;

// A MÁGICA AQUI: Puxando a chave mestra para ignorar o bloqueio do RLS
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

if (!supabaseUrl || !supabaseKey) {
    console.error("⚠️ ALERTA: Faltam variáveis do Supabase no arquivo .env!");
}

// Cria a conexão com poderes de administrador (ignora as regras do RLS)
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;