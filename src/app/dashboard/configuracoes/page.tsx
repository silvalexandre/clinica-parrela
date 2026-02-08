"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { FaSave, FaWhatsapp, FaInstagram, FaLinkedin, FaPhone, FaMapMarkerAlt, FaEnvelope } from "react-icons/fa";
import { DashboardTitle } from "@/components/ui/DashboardTitle"; // <--- Importa aqui

export default function ConfigPage() {
  const [loading, setLoading] = useState(false);
  
  // Estado inicial com valores vazios
  const [config, setConfig] = useState({
    id: 1,
    telefone: "",
    whatsapp: "",
    endereco: "",
    email_contato: "",
    link_instagram: "",
    link_linkedin: ""
  });

  // 1. Busca os dados atuais ao carregar a página
  useEffect(() => {
    async function fetchConfig() {
      const { data } = await supabase.from("configuracoes").select("*").single();
      if (data) setConfig(data);
    }
    fetchConfig();
  }, []);

  // 2. Salva as alterações
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("configuracoes")
      .update(config)
      .eq("id", 1); // Atualiza sempre a linha 1 (única)

    if (error) {
      alert("Erro ao salvar: " + error.message);
    } else {
      alert("Configurações atualizadas com sucesso!");
    }
    setLoading(false);
  }

  // Função genérica para atualizar os campos do estado
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  }
  

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">

        <DashboardTitle 
          title="" 
          subtitle="Voltar para o dashboard"
          backUrl="/dashboard" // Se não colocar nada, ele volta para /dashboard por padrão
        />
        
        <h1 className="text-2xl font-bold text-primary font-serif mb-8">Configurações do Site</h1>

        <form onSubmit={handleSave} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
          
          {/* Seção de Contato */}
          <div>
            <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Informações de Contato</h3>
            <div className="grid md:grid-cols-2 gap-6">
              
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2">
                  <FaPhone className="text-accent" /> Telefone Fixo
                </label>
                <input 
                  name="telefone"
                  value={config.telefone || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-3 focus:border-accent outline-none"
                  placeholder="(00) 0000-0000"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2">
                  <FaWhatsapp className="text-green-500" /> WhatsApp (Apenas números)
                </label>
                <input 
                  name="whatsapp"
                  value={config.whatsapp || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-3 focus:border-accent outline-none"
                  placeholder="5511999999999"
                />
                <p className="text-xs text-gray-400 mt-1">Use o formato internacional: 55 + DDD + Número</p>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2">
                  <FaEnvelope className="text-accent" /> E-mail de Contato
                </label>
                <input 
                  name="email_contato"
                  value={config.email_contato || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-3 focus:border-accent outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2">
                  <FaMapMarkerAlt className="text-accent" /> Endereço Completo
                </label>
                <input 
                  name="endereco"
                  value={config.endereco || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-3 focus:border-accent outline-none"
                />
              </div>

            </div>
          </div>

          {/* Seção de Redes Sociais */}
          <div>
            <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Redes Sociais</h3>
            <div className="grid md:grid-cols-2 gap-6">
              
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2">
                  <FaInstagram className="text-pink-600" /> Usuário Instagram
                </label>
                <div className="flex">
                  <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l p-3 text-gray-500">@</span>
                  <input 
                    name="link_instagram"
                    value={config.link_instagram || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-r p-3 focus:border-accent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2">
                  <FaLinkedin className="text-blue-700" /> Usuário LinkedIn
                </label>
                <div className="flex">
                  <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l p-3 text-gray-500">in/</span>
                  <input 
                    name="link_linkedin"
                    value={config.link_linkedin || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-r p-3 focus:border-accent outline-none"
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="gold" className="flex items-center gap-2 px-8 py-3 shadow-lg" disabled={loading}>
              <FaSave /> {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}