"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { FaTrash, FaPlus, FaImage, FaHeading, FaUpload } from "react-icons/fa";
import { DashboardTitle } from "@/components/ui/DashboardTitle"; // <--- Importa aqui

interface Instalacao {
  id: number;
  titulo: string;
  imagem_url: string;
}

export default function InstalacoesPage() {
  const [items, setItems] = useState<Instalacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const { data } = await supabase.from("instalacoes").select("*").order("id", { ascending: false });
    if (data) setItems(data);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!novoTitulo || !arquivo) return alert("Preencha tudo");
    
    setLoading(true);
    try {
      const fileName = `${Date.now()}.${arquivo.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('galeria').upload(fileName, arquivo);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('galeria').getPublicUrl(fileName);

      const { error: dbError } = await supabase.from("instalacoes").insert({
        titulo: novoTitulo,
        imagem_url: publicUrl
      });
      if (dbError) throw dbError;

      setNovoTitulo("");
      setArquivo(null);
      fetchItems();
    } catch (error: any) {
      alert("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Apagar?")) return;
    const { error } = await supabase.from("instalacoes").delete().eq("id", id);
    if (!error) setItems(items.filter(i => i.id !== id));
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">

      <DashboardTitle 
        title="" 
        subtitle="Voltar para o dashboard"
        backUrl="/dashboard" // Se não colocar nada, ele volta para /dashboard por padrão
      />

      <h1 className="text-2xl font-bold mb-8">Galeria de Instalações</h1>
      
      <form onSubmit={handleAdd} className="bg-white p-6 rounded shadow mb-8 grid md:grid-cols-3 gap-4">
        <input 
          value={novoTitulo} 
          onChange={e => setNovoTitulo(e.target.value)} 
          placeholder="Legenda" 
          className="border p-2 rounded"
        />
        <input 
          type="file" 
          onChange={e => setArquivo(e.target.files?.[0] || null)} 
          className="border p-2 rounded"
        />
        <Button disabled={loading}>{loading ? "Enviando..." : "Adicionar"}</Button>
      </form>

      <div className="grid grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id} className="relative group">
            <img src={item.imagem_url} className="w-full h-32 object-cover rounded" />
            <button onClick={() => handleDelete(item.id)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100">
              <FaTrash />
            </button>
            <p className="mt-1 text-sm font-bold">{item.titulo}</p>
          </div>
        ))}
      </div>
    </div>
  );
}