"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FaSave, FaArrowLeft, FaBook } from "react-icons/fa";
import Link from "next/link";

export default function NovoPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: "",
    resumo: "",
    conteudo: "",
    imagem_url: "",
    bibliografia: "" // <--- Novo Campo
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("posts").insert(formData);

    if (error) {
      alert("Erro ao criar post: " + error.message);
    } else {
      router.push("/dashboard/posts");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard/posts" className="flex items-center gap-2 text-gray-500 mb-6 hover:text-primary">
          <FaArrowLeft /> Voltar
        </Link>

        <h1 className="text-2xl font-bold text-primary font-serif mb-8">Novo Artigo</h1>

        <form onSubmit={handleSave} className="bg-white p-8 rounded-xl shadow-sm border space-y-6">
          
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
            <label className="block text-sm font-bold text-gray-700 mb-2">Resumo (Chamada)</label>
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
              placeholder="https://..."
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

          {/* CAMPO BIBLIOGRAFIA */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <label className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-2">
              <FaBook /> Bibliografia / Fontes
            </label>
            <textarea 
              className="w-full border p-3 rounded focus:outline-primary h-24 text-sm"
              value={formData.bibliografia}
              onChange={e => setFormData({...formData, bibliografia: e.target.value})}
              placeholder="Ex: Fonte: Ministério da Saúde. Diretrizes de 2024..."
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="primary" disabled={loading} className="px-8">
              <FaSave className="mr-2" /> {loading ? "Publicando..." : "Publicar Artigo"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}