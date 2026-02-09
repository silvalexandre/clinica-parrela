'use client';

import { useState, useEffect } from 'react';
import { 
  InboxIcon, 
  ArrowPathIcon, 
  EnvelopeOpenIcon, 
  XMarkIcon, 
  CalendarIcon,
  TrashIcon,
  ExclamationTriangleIcon // Ícone de Alerta
} from '@heroicons/react/24/outline';

export default function EmailsPage() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para controlar os Modais
  const [emailSelecionado, setEmailSelecionado] = useState<any>(null); // Modal de Leitura
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null); // Modal de Confirmação
  const [excluindo, setExcluindo] = useState(false); // Loading do botão de excluir

  // --- BUSCAR EMAILS ---
  const fetchEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/emails', { cache: 'no-store' });
      const data = await response.json();
      setEmails(data || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmails(); }, []);

  // --- LÓGICA DE EXCLUSÃO ---
  
  // 1. Abre o modal de confirmação
  const pedirConfirmacao = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIdParaExcluir(id);
  };

  // 2. Executa a exclusão de fato
  const confirmarExclusao = async () => {
    if (!idParaExcluir) return;

    setExcluindo(true);
    try {
      const response = await fetch(`/api/admin/emails?id=${idParaExcluir}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove da lista visualmente
        setEmails((prev) => prev.filter((email) => email.id !== idParaExcluir));
        
        // Se estava lendo esse email, fecha a leitura também
        if (emailSelecionado?.id === idParaExcluir) {
          setEmailSelecionado(null);
        }
        
        // Fecha o modal de confirmação
        setIdParaExcluir(null);
      } else {
        alert('Erro ao excluir. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
    } finally {
      setExcluindo(false);
    }
  };

  const formatarData = (dataString: string) => {
    if (!dataString) return '-';
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
      }).format(new Date(dataString));
    } catch (e) { return dataString; }
  };

  return (
    <div className="space-y-6 p-6 relative">
      {/* CABEÇALHO */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Caixa de Entrada</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie as mensagens recebidas.</p>
        </div>
        <button
          onClick={fetchEmails}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-all active:scale-95"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* LISTA DE EMAILS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Carregando mensagens...</div>
        ) : emails.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <InboxIcon className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Nenhuma mensagem encontrada.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {emails.map((email) => (
              <li 
                key={email.id} 
                onClick={() => setEmailSelecionado(email)}
                className="hover:bg-blue-50 cursor-pointer transition-colors duration-150 group relative"
              >
                <div className="px-6 py-4 flex items-start gap-4 pr-14">
                  <div className={`mt-1 p-2 rounded-full ${email.lida ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600'}`}>
                    <EnvelopeOpenIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <p className="font-bold text-gray-900 text-sm truncate">
                        {email.nome || 'Sem Nome'}
                      </p>
                      <span className="text-xs text-gray-500 flex items-center bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        {formatarData(email.data_envio)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 truncate">{email.assunto}</p>
                    <p className="text-sm text-gray-500 truncate mt-1">{email.texto}</p>
                  </div>

                  {/* BOTÃO EXCLUIR NA LISTA */}
                  <button
                    onClick={(e) => pedirConfirmacao(email.id, e)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                    title="Excluir"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* --- MODAL 1: LEITURA DE EMAIL --- */}
      {emailSelecionado && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
             onClick={() => setEmailSelecionado(null)}>
          
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in duration-200"
               onClick={(e) => e.stopPropagation()}>
            
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Leitura da Mensagem</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => pedirConfirmacao(emailSelecionado.id)}
                  className="p-2 hover:bg-red-100 hover:text-red-600 rounded-full text-gray-400 transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
                <button onClick={() => setEmailSelecionado(null)} className="p-2 hover:bg-gray-200 rounded-full">
                  <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 font-bold mb-1">DE:</p>
                    <p className="text-gray-900 font-medium">{emailSelecionado.nome}</p>
                    <p className="text-blue-600">{emailSelecionado.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 font-bold mb-1">ENVIADO EM:</p>
                    <p className="text-gray-900">{formatarData(emailSelecionado.data_envio)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 font-bold text-sm mb-1">ASSUNTO:</p>
                  <p className="text-lg font-bold text-gray-900 break-words">{emailSelecionado.assunto}</p>
                </div>
                <div className="border-t pt-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {emailSelecionado.texto}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button 
                onClick={() => setEmailSelecionado(null)}
                className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 shadow-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: CONFIRMAÇÃO DE EXCLUSÃO (O BONITINHO) --- */}
      {idParaExcluir && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center animate-in zoom-in-95 duration-200">
            
            {/* Ícone de Alerta */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Excluir mensagem?
            </h3>
            
            <p className="text-sm text-gray-500 mb-6">
              Você tem certeza que deseja apagar esta mensagem permanentemente? <br/>
              <span className="font-semibold text-red-500">Essa ação não pode ser desfeita.</span>
            </p>
            
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
                onClick={() => setIdParaExcluir(null)}
                disabled={excluindo}
              >
                Cancelar
              </button>
              
              <button
                type="button"
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px]"
                onClick={confirmarExclusao}
                disabled={excluindo}
              >
                {excluindo ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin mr-2" />
                    Apagando...
                  </>
                ) : (
                  'Sim, Excluir'
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}