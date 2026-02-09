import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Função auxiliar para conectar com a Chave Mestra
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
};

// --- GET: Buscar Emails ---
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    // Busca ordenando pela data de envio (mais novo primeiro)
    const { data, error } = await supabase
      .from('mensagens')
      .select('*')
      .order('data_envio', { ascending: false });

    if (error) throw new Error(`ERRO DO BANCO: ${error.message}`);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- DELETE: Apagar Email ---
export async function DELETE(request: Request) {
  try {
    // Pega o ID da URL (ex: .../emails?id=123)
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    
    // Deleta a mensagem com aquele ID
    const { error } = await supabase
      .from('mensagens')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}