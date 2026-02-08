"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { DashboardTitle } from "@/components/ui/DashboardTitle"; // Seu título padrão
import { FaEnvelope, FaEnvelopeOpen, FaTrash, FaClock } from "react-icons/fa";

// Definindo o tipo exato do banco de dados
interface Mensagem {
  id: number;
  nome: string;
  email: string;
  texto: string; // <--- O segredo: Aqui tem que ser 'texto' igual no banco
  lida: boolean;
  data_envio: string;
}

export default function MensagensPage() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Busca as mensagens ao carregar
  useEffect(() => {
    fetchMensagens();
  }, []);

  async function fetchMensagens() {
    try {
      setLoading(true);
      // Busca todas as mensagens, ordenando da mais recente para a mais antiga
      const { data, error } = await supabase
        .from("mensagens")
        .select("*")
        .order("data_envio", { ascending: false });

      if (error) throw error;

      if (data) {
        setMensagens(data);
      }
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    } finally {
      setLoading(false);
    }
  }

  // Função para Marcar como Lida/Não Lida
  async function toggleLida(id: number, statusAtual: boolean) {
    const { error } = await supabase
      .from("mensagens")
      .update({ lida: !statusAtual })
      .eq("id", id);

    if (!error) fetchMensagens(); // Recarrega a lista
  }

  // Função para Excluir
  async function excluirMensagem(id: number) {
    if (!confirm("Tem certeza que deseja excluir esta mensagem?")) return;

    const { error } = await supabase
      .from("mensagens")
      .delete()
      .eq("id", id);

    if (!error) fetchMensagens(); // Recarrega a lista
  }

  // Função para formatar data bonita (ex: 22/01/2026 às 16:30)
  function formatarData(dataISO: string) {
    return new Date(dataISO).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="p-8">
      <DashboardTitle 
        title="Caixa de Entrada" 
        subtitle="Gerencie os contatos recebidos pelo site." 
      />

      {loading ? (
        <p className="text-gray-500">Carregando mensagens...</p>
      ) : mensagens.length === 0 ? (
        // Estado Vazio (Empty State)
        <div className="bg-white p-12 rounded-lg shadow-sm text-center border border-gray-100">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <FaEnvelope size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Sua caixa de entrada está vazia</h3>
          <p className="text-gray-500 mt-1">Novas mensagens aparecerão aqui.</p>
        </div>
      ) : (
        // Lista de Mensagens
        <div className="grid gap-4">
          {mensagens.map((msg) => (
            <div 
              key={msg.id} 
              className={`bg-white p-6 rounded-lg shadow-sm border-l-4 transition-all hover:shadow-md ${
                msg.lida ? "border-gray-200 opacity-75" : "border-[#c5a47e]"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    {msg.nome}
                    {!msg.lida && (
                      <span className="bg-[#c5a47e] text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Nova
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500">{msg.email}</p>
                </div>
                
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <FaClock />
                  {formatarData(msg.data_envio)}
                </div>
              </div>

              {/* AQUI ESTÁ A CORREÇÃO: msg.texto em vez de msg.mensagem */}
              <p className="text-gray-600 bg-gray-50 p-4 rounded-md text-sm leading-relaxed mb-4">
                {msg.texto} 
              </p>

              <div className="flex gap-3 justify-end border-t pt-4 border-gray-100">
                <button 
                  onClick={() => toggleLida(msg.id, msg.lida)}
                  className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#c5a47e] transition-colors uppercase tracking-wider"
                >
                  {msg.lida ? <><FaEnvelopeOpen /> Marcar como não lida</> : <><FaEnvelope /> Marcar como lida</>}
                </button>
                
                <button 
                  onClick={() => excluirMensagem(msg.id)}
                  className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-wider ml-4"
                >
                  <FaTrash /> Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}