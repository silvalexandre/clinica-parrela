"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FaSave, FaArrowLeft, FaBook } from "react-icons/fa";
import Link from "next/link";
import { use } from "react"; // Necessário para Next.js 15+ params

export default function EditarPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // Desembrulha o ID
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: "",
    resumo: "",
    conteudo: "",
    imagem_url: "",
    bibliografia: ""
  });

  // 1. Busca os dados do post ao abrir a página
  useEffect(() => {
    async function fetchPost() {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) {
        alert("Post não encontrado");
        router.push("/dashboard/posts");
      } else if (data) {
        setFormData({
          titulo: data.titulo || "",
          resumo: data.resumo || "",
          conteudo: data.conteudo || "",
          imagem_url: data.imagem_url || "",
          bibliografia: data.bibliografia || ""
        });
      }
    }
    fetchPost();
  }, [id, router]);

  // 2. Salva as alterações (UPDATE)
  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("posts")
      .update(formData) // Atualiza com os novos dados
      .eq("id", id);    // Onde o ID for igual ao da URL

    if (error) {
      alert("Erro ao atualizar: " + error.message);
    } else {
      alert("Post atualizado com sucesso!");
      router.push("/dashboard/posts");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard/posts" className="flex items-center gap-2 text-gray-500 mb-6 hover:text-primary">
          <FaArrowLeft /> Cancelar e Voltar
        </Link>

        <h1 className="text-2xl font-bold text-primary font-serif mb-8">Editar Artigo</h1>

        <form onSubmit={handleUpdate} className="bg-white p-8 rounded-xl shadow-sm border space-y-6">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Título do Artigo</label>
            <input 
              className="w-full border p-3 rounded focus:outline-primary"
              value={formData.titulo}
              onChange={e => setFormData({...formData, titulo: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Resumo</label>
            <textarea 
              className="w-full border p-3 rounded focus:outline-primary h-24"
              value={formData.resumo}
              onChange={e => setFormData({...formData, resumo: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Imagem de Capa (URL)</label>
            <input 
              className="w-full border p-3 rounded focus:outline-primary"
              value={formData.imagem_url}
              onChange={e => setFormData({...formData, imagem_url: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Conteúdo Completo</label>
            <textarea 
              className="w-full border p-3 rounded focus:outline-primary h-96"
              value={formData.conteudo}
              onChange={e => setFormData({...formData, conteudo: e.target.value})}
              required
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <label className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-2">
              <FaBook /> Bibliografia / Fontes
            </label>
            <textarea 
              className="w-full border p-3 rounded focus:outline-primary h-24 text-sm"
              value={formData.bibliografia}
              onChange={e => setFormData({...formData, bibliografia: e.target.value})}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="gold" disabled={loading} className="px-8">
              <FaSave className="mr-2" /> {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}