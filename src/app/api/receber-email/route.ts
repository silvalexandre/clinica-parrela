import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 1. Função GET: Permite você testar o link no navegador para ver se está no ar
export async function GET() {
  return NextResponse.json({ status: "A API de e-mail está FUNCIONANDO e pronta para receber." });
}

// 2. Função POST: É onde o Cloudmailin vai bater
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Recebendo webhook Cloudmailin:", body);

    // Tenta extrair o remetente
    const rawFrom = body.headers?.from || body.envelope?.from || "Desconhecido";
    let nome = "Desconhecido";
    let email = "externo@email.com";

    // Lógica para separar "Nome <email>"
    if (rawFrom.includes("<")) {
      const parts = rawFrom.split("<");
      nome = parts[0].trim().replace(/"/g, "");
      email = parts[1].replace(">", "").trim();
    } else {
      email = rawFrom.trim();
    }

    const assunto = body.headers?.subject || "Sem Assunto";
    const texto = body.plain || "Conteúdo HTML ou Anexo (não suportado em texto puro)";

    // Salva no Supabase
    const { error } = await supabase.from("mensagens").insert([
      {
        nome: nome,
        email: email,
        assunto: assunto,
        texto: texto,
        origem: 'email', 
        lida: false,
        data_envio: new Date().toISOString()
      }
    ]);

    if (error) {
      console.error("Erro Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Erro API:", error);
    return NextResponse.json({ error: "Erro interno no processamento" }, { status: 500 });
  }
}