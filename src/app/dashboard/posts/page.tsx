"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { FaPlus, FaTrash, FaPen, FaSearch, FaNewspaper } from "react-icons/fa";
import { DashboardTitle } from "@/components/ui/DashboardTitle";

interface Post {
  id: number;
  titulo: string;
  created_at: string;
  resumo: string;
}

export default function PostsDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Busca os posts ao carregar
  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setPosts(data);
    setLoading(false);
  }

  // 2. Função de Deletar
  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir este artigo permanentemente?")) return;

    const { error } = await supabase.from("posts").delete().eq("id", id);
    
    if (error) {
      alert("Erro ao excluir post.");
    } else {
      // Remove da lista visualmente sem precisar recarregar
      setPosts(posts.filter(post => post.id !== id));
    }
  }

  // Filtra os posts pela busca
  const filteredPosts = posts.filter(post => 
    post.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-gray-500">Carregando artigos...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">

        <DashboardTitle 
          title="" 
          subtitle="Voltar para o dashboard"
          backUrl="/dashboard" // Se não colocar nada, ele volta para /dashboard por padrão
        />
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary font-serif flex items-center gap-2">
              <FaNewspaper /> Gerenciar Blog
            </h1>
            <p className="text-sm text-gray-500">Publique novidades e artigos informativos.</p>
          </div>
          
          <Link href="/dashboard/posts/novo">
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-bold shadow-md">
              <FaPlus /> Novo Artigo
            </button>
          </Link>
        </div>

        {/* BARRA DE BUSCA */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
          <FaSearch className="text-gray-400" />
          <input 
            placeholder="Buscar por título..." 
            className="w-full outline-none text-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* LISTA DE POSTS */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
            <p className="text-gray-400">Nenhum artigo encontrado.</p>
          </div>
        ) : (
          <div className="grid gap-4">            
            {filteredPosts.map((post) => (
              <div key={post.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                
                {/* Informações do Post */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 mb-1">{post.titulo}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Publicado em {new Date(post.created_at).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-400 line-clamp-1">{post.resumo}</p>
                </div>

                {/* Ações (Editar e Excluir) */}
                <div className="flex items-center gap-2">
                  
                  {/* BOTÃO DE EDITAR (NOVO) */}
                  <Link 
                    href={`/dashboard/posts/editar/${post.id}`}
                    className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                    title="Editar Artigo"
                  >
                    <FaPen size={14} />
                  </Link>

                  {/* BOTÃO DE EXCLUIR */}
                  <button 
                    onClick={() => handleDelete(post.id)}
                    className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all border border-red-100"
                    title="Excluir Artigo"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}