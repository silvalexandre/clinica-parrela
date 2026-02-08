"use client";

import { useState, useEffect } from "react";
import { FaInstagram, FaLinkedinIn, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { supabase } from "@/lib/supabase";

export function ContactForm() {
  // ESTADO 1: Dados de contato do lado direito (busca do banco)
  const [socials, setSocials] = useState({
    instagram: "parrelamedicina",
    linkedin: "romuloparrela",
    whatsapp: "5538999999999",
    email: "contato@parrelamedicina.com.br"
  });

  // ESTADO 2: Dados do formulário (o que o usuário digita)
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    mensagem: ""
  });

  // BUSCA DADOS DE CONFIGURAÇÃO (Lado Direito)
  useEffect(() => {
    async function fetchConfig() {
      try {
        const { data } = await supabase.from("configuracoes").select("*").limit(1);
        if (data && data.length > 0) {
          const item = data[0];
          setSocials({
            instagram: item.link_instagram || "parrelamedicina",
            linkedin: item.link_linkedin || "romuloparrela",
            whatsapp: item.whatsapp || "5538999999999",
            email: item.email_contato || "contato@parrelamedicina.com.br"
          });
        }
      } catch (error) {
        console.error("Erro config:", error);
      }
    }
    fetchConfig();
  }, []);

  // --- A LÓGICA QUE FALTAVA (ENVIAR PARA O BANCO) ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // 1. Validação simples
    if (!formData.nome || !formData.email || !formData.mensagem) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);

    try {
      // 2. Insere na tabela 'mensagens'
      const { error } = await supabase
        .from("mensagens")
        .insert([
          { 
            nome: formData.nome, 
            email: formData.email, 
            texto: formData.mensagem, // Confirme se sua coluna é 'texto' ou 'mensagem'
            lida: false,              // Importante para aparecer como "Nova" no painel
            data_envio: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      // 3. Sucesso
      alert("Mensagem enviada com sucesso! Em breve entraremos em contato.");
      setFormData({ nome: "", email: "", mensagem: "" }); // Limpa os campos

    } catch (error: any) {
      console.error("Erro ao enviar:", error);
      alert("Erro ao enviar mensagem. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full py-16 bg-gray-50 flex justify-center px-4 md:px-0">
      <div className="container max-w-5xl flex flex-col md:flex-row shadow-2xl rounded-lg overflow-hidden min-h-[500px]">
        
        {/* --- LADO ESQUERDO: FORMULÁRIO (ESCURO) --- */}
        <div className="w-full md:w-3/5 bg-[#1e2329] p-10 md:p-14 text-white flex flex-col justify-center">
          
          <h2 className="font-serif text-3xl font-bold mb-2 text-white">
            Fale Conosco
          </h2>
          <p className="text-gray-400 text-sm mb-10 font-light">
            Solicite orçamentos ou tire suas dúvidas com nossos especialistas.
          </p>

          <form className="space-y-8" onSubmit={handleSubmit}>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Input Nome */}
              <div className="relative">
                <input 
                  type="text" 
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Nome Completo" 
                  className="w-full bg-transparent border-b border-gray-600 py-2 text-sm focus:outline-none focus:border-[#c5a47e] transition-colors placeholder-gray-500"
                />
                <label className="absolute -top-4 left-0 text-[10px] uppercase tracking-wider text-[#c5a47e] font-bold">
                  Seu Nome
                </label>
              </div>

              {/* Input Email */}
              <div className="relative">
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="contato@empresa.com" 
                  className="w-full bg-transparent border-b border-gray-600 py-2 text-sm focus:outline-none focus:border-[#c5a47e] transition-colors placeholder-gray-500"
                />
                <label className="absolute -top-4 left-0 text-[10px] uppercase tracking-wider text-[#c5a47e] font-bold">
                  Seu E-mail
                </label>
              </div>
            </div>

            {/* Input Mensagem */}
            <div className="relative mt-8">
              <textarea 
                rows={3}
                required
                value={formData.mensagem}
                onChange={(e) => setFormData({...formData, mensagem: e.target.value})}
                placeholder="Como podemos ajudar sua empresa?" 
                className="w-full bg-transparent border-b border-gray-600 py-2 text-sm focus:outline-none focus:border-[#c5a47e] transition-colors placeholder-gray-500 resize-none"
              ></textarea>
              <label className="absolute -top-4 left-0 text-[10px] uppercase tracking-wider text-[#c5a47e] font-bold">
                Mensagem
              </label>
            </div>

            {/* Botão Enviar */}
            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-xs font-bold tracking-[0.15em] uppercase transition-all mt-4 rounded-sm shadow-lg ${
                loading 
                  ? "bg-gray-600 cursor-not-allowed text-gray-400" 
                  : "bg-[#c5a47e] hover:bg-[#b08d65] text-white"
              }`}
            >
              {loading ? "Enviando..." : "Enviar Mensagem"}
            </button>

          </form>
        </div>

        {/* --- LADO DIREITO: CONECTE-SE (DOURADO) --- */}
        <div className="w-full md:w-2/5 bg-[#cba983] p-10 md:p-14 text-[#1e2329] flex flex-col justify-center relative">
          
          <h2 className="font-serif text-3xl font-bold mb-10 text-[#1e2329]">
            Conecte-se
          </h2>

          <div className="space-y-6">
            
            <a href={`https://instagram.com/${socials.instagram}`} target="_blank" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-[#1e2329] text-[#cba983] flex items-center justify-center shadow-md">
                <FaInstagram size={18} />
              </div>
              <span className="font-medium text-sm">@{socials.instagram}</span>
            </a>

            <a href={`https://linkedin.com/in/${socials.linkedin}`} target="_blank" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-[#1e2329] text-[#cba983] flex items-center justify-center shadow-md">
                <FaLinkedinIn size={18} />
              </div>
              <span className="font-medium text-sm">LinkedIn Profissional</span>
            </a>

            <a href={`https://wa.me/${socials.whatsapp}`} target="_blank" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-[#1e2329] text-[#cba983] flex items-center justify-center shadow-md">
                <FaWhatsapp size={18} />
              </div>
              <span className="font-medium text-sm">WhatsApp Comercial</span>
            </a>

          </div>

          <div className="mt-16 pt-6 border-t border-[#1e2329]/20">
            <a href={`mailto:${socials.email}`} className="flex items-center gap-3 text-sm font-medium hover:underline">
              <FaEnvelope />
              {socials.email}
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}