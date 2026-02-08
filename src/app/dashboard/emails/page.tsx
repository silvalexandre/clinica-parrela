"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FaInbox, FaEnvelope, FaEnvelopeOpen, FaTrash, FaReply, FaClock, FaSearch } from "react-icons/fa";

// Definimos o formato dos dados
interface EmailMsg {
  id: number;
  nome: string;
  email: string;
  assunto: string;
  texto: string;
  lida: boolean;
  data_envio: string;
  origem: string;
}

// O ERRO ESTAVA PROVAVELMENTE AQUI: O export default tem que existir
export default function EmailsPage() {
  const [emails, setEmails] = useState<EmailMsg[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca os dados ao carregar a página
  useEffect(() => {
    fetchEmails();
  }, []);

  async function fetchEmails() {
    try {
      setLoading(true);
      
      // Busca apenas mensagens com origem 'email'
      const { data, error } = await supabase
        .from("mensagens")
        .select("*")
        .eq("origem", "email") 
        .order("data_envio", { ascending: false });

      if (error) throw error;
      if (data) setEmails(data);

    } catch (error) {
      console.error("Erro ao buscar emails:", error);
    } finally {
      setLoading(false);
    }
  }

  // Marcar como lida/não lida
  async function toggleLida(id: number, statusAtual: boolean) {
    const { error } = await supabase
      .from("mensagens")
      .update({ lida: !statusAtual })
      .eq("id", id);

    if (!error) fetchEmails(); // Atualiza a lista
  }

  // Excluir e-mail
  async function excluirEmail(id: number) {
    if (!confirm("Tem certeza que deseja excluir este e-mail permanentemente?")) return;

    const { error } = await supabase
      .from("mensagens")
      .delete()
      .eq("id", id);

    if (!error) fetchEmails();
  }

  // Formata a data para ficar bonita (Ex: 10 Fev - 14:30)
  function formatarData(dataISO: string) {
    return new Date(dataISO).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="p-8 max-w-6xl mx-auto h-full flex flex-col">
      
      {/* Cabeçalho da Página */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-800 flex items-center gap-3">
            <FaInbox className="text-blue-600" /> Caixa de E-mail
          </h1>
          <p className="text-gray-500 mt-2">
            Mensagens recebidas externamente (Outlook, Gmail, etc).
          </p>
        </div>
        
        {/* Botão de Atualizar Manual */}
        <button 
          onClick={fetchEmails}
          className="text-sm text-blue-600 hover:text-blue-800 font-bold uppercase tracking-wider flex items-center gap-2"
        >
          <FaSearch /> Atualizar
        </button>
      </div>

      {/* LISTAGEM */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 animate-pulse">
          <FaInbox size={40} className="mb-4 opacity-50" />
          <p>Sincronizando caixa de entrada...</p>
        </div>
      ) : emails.length === 0 ? (
        // Estado Vazio
        <div className="bg-white p-16 rounded-2xl shadow-sm text-center border border-gray-100 flex flex-col items-center justify-center">
          <div className="bg-blue-50 p-6 rounded-full mb-4">
            <FaInbox className="text-blue-300 text-5xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Tudo limpo!</h3>
          <p className="text-gray-500 mt-2 max-w-sm">
            Nenhum e-mail externo foi recebido ainda.
            <br/><span className="text-xs text-gray-400">(Lembre-se de configurar o encaminhamento)</span>
          </p>
        </div>
      ) : (
        // Lista de E-mails
        <div className="space-y-4">
          {emails.map((msg) => (
            <div 
              key={msg.id} 
              className={`group relative bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
                msg.lida 
                  ? "border-gray-200 bg-gray-50 opacity-80" // Estilo LIDO
                  : "border-l-4 border-l-blue-500 border-y-gray-100 border-r-gray-100" // Estilo NÃO LIDO
              }`}
            >
              <div className="p-5 flex flex-col gap-3">
                
                {/* Linha 1: Remetente e Data */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                        msg.lida ? "bg-gray-200 text-gray-500" : "bg-blue-600 text-white"
                      }`}>
                      {msg.nome ? msg.nome.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{msg.nome}</h4>
                      <span className="text-xs text-gray-500">&lt;{msg.email}&gt;</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                    <FaClock size={10} /> {formatarData(msg.data_envio)}
                  </div>
                </div>

                {/* Linha 2: Assunto e Texto */}
                <div className="pl-11">
                  <h3 className={`text-base mb-1 ${msg.lida ? "font-medium text-gray-600" : "font-bold text-gray-900"}`}>
                    {msg.assunto || "(Sem Assunto)"}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                    {msg.texto}
                  </p>
                </div>

                {/* Linha 3: Ações (Botões) */}
                <div className="pl-11 pt-3 mt-2 border-t border-gray-100 flex gap-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  
                  {/* Botão Responder (Abre o email do computador da pessoa) */}
                  <a 
                    href={`mailto:${msg.email}?subject=Re: ${msg.assunto}`}
                    className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-blue-600 uppercase transition-colors"
                    title="Responder via E-mail"
                  >
                    <FaReply /> Responder
                  </a>

                  <button 
                    onClick={() => toggleLida(msg.id, msg.lida)}
                    className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-800 uppercase transition-colors"
                  >
                    {msg.lida ? <><FaEnvelopeOpen /> Marcar não lida</> : <><FaEnvelope /> Marcar lida</>}
                  </button>

                  <button 
                    onClick={() => excluirEmail(msg.id)}
                    className="flex items-center gap-2 text-xs font-bold text-red-300 hover:text-red-500 uppercase transition-colors ml-auto"
                  >
                    <FaTrash /> Excluir
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}