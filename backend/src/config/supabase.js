const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;

// Tenta usar a SERVICE_KEY (Poder total), se não tiver, usa a KEY normal.
// Isso garante que o Backend consiga fazer uploads sem ser bloqueado.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;