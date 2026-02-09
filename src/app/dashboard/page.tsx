"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
// ADICIONEI O FaInbox AQUI NOS IMPORTS
import { FaSignOutAlt, FaEnvelope, FaNewspaper, FaHome, FaCog, FaImages, FaInbox } from "react-icons/fa";
import Link from "next/link";


export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  // --- 1. SEGURANÇA: Verifica se tem usuário logado ---
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Se não tiver sessão, chuta para o login
        router.push("/dashboard");
      } else {
        // Se tiver, libera o acesso
        setUserEmail(session.user.email || "Admin");
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  // --- 2. LOGOUT: Sair do sistema ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-primary">Carregando painel...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      
      {/* --- SIDEBAR (Barra Lateral) --- */}
      <aside className="w-64 bg-primary text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-700">
          <h2 className="font-serif text-xl font-bold">Painel Dr. Parrela</h2>
          <p className="text-xs text-gray-400 mt-1">Bem-vindo, {userEmail}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">

          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded text-accent font-medium">
            <FaHome /> Visão Geral
          </Link>

          <Link href="/dashboard/instalacoes" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded transition-colors">
            <FaImages /> Instalações
          </Link>
          
          <Link href="/dashboard/mensagens" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded transition-colors">
            <FaEnvelope /> Mensagens do Site
          </Link>

          {/* --- NOVO LINK: CAIXA DE E-MAIL --- */}
          <Link href="/dashboard/emails" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded transition-colors">
            <FaInbox /> Caixa de E-mail
          </Link>
          
          <Link href="/dashboard/posts" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded transition-colors">
            <FaNewspaper /> Blog Posts
          </Link>

          <Link href="/dashboard/configuracoes" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded transition-colors">
            <FaCog /> Configurações
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-300 hover:text-red-100 text-sm w-full transition-colors">
            <FaSignOutAlt /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Topo Mobile (Só aparece no celular) */}
        <div className="md:hidden mb-6 flex justify-between items-center">
          <h1 className="font-serif text-xl font-bold text-primary">Painel Admin</h1>
          <button onClick={handleLogout} className="text-red-500"><FaSignOutAlt /></button>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Visão Geral</h1>

        {/* Cards de Resumo */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card Mensagens (Site) */}
          <Link href="/dashboard/mensagens" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Site</p>
                <h3 className="text-2xl font-bold text-primary mt-2">Mensagens</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaEnvelope size={20} />
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-4">Do formulário de contato</p>
          </Link>

          {/* --- NOVO CARD: CAIXA DE E-MAIL --- */}
          <Link href="/dashboard/emails" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Externo</p>
                <h3 className="text-2xl font-bold text-primary mt-2">E-mails</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaInbox size={20} />
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-4">Vindos do Outlook/Gmail</p>
          </Link>

          {/* Card Blog */}
          <Link href="/dashboard/posts" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Blog</p>
                <h3 className="text-2xl font-bold text-primary mt-2">Artigos</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaNewspaper size={20} />
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-4">Publique ou edite</p>
          </Link>

          {/* Card Atalho Site */}
          <a href="/" target="_blank" className="bg-gradient-to-br from-primary to-gray-800 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-accent uppercase font-bold tracking-wider">Público</p>
                <h3 className="text-2xl font-bold mt-2">Ver Site</h3>
              </div>
            </div>
            <p className="text-sm text-gray-300 mt-4 group-hover:text-white">Acessar página &rarr;</p>
          </a>

        </div>
      </main>
    </div>
  );
}