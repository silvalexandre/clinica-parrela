import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../../styles/AdminPanel.css';

const EmailsViewer = () => {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null); // Para abrir e fechar o corpo do e-mail

    useEffect(() => {
        fetchEmails();
    }, []);

    const fetchEmails = async () => {
        setLoading(true);
        
        // 1. Pegamos o crachá de segurança (Força Bruta)
        const token = localStorage.getItem('token');
        if (!token) {
            Swal.fire('Sessão Expirada', 'Por favor, faça login novamente.', 'error');
            setLoading(false);
            return;
        }

        try {
            // 2. Buscamos os e-mails na rota passando o crachá
            const response = await api.get('/emails', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            setEmails(response.data || []);
        } catch (error) {
            // 3. O Fofoqueiro: Captura o erro exato
            const mensagemErro = error.response?.data?.error || error.message || 'Erro ao conectar com o servidor de e-mail.';
            console.error("Fofoca do Erro de E-mail:", error.response || error);
            
            Swal.fire('Falha na Conexão IMAP', `Motivo: ${mensagemErro}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Função para expandir/recolher o corpo do e-mail ao clicar
    const toggleEmail = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    // Função para deletar o e-mail permanentemente da Hostinger
    const handleDelete = (uid, e) => {
        e.stopPropagation(); // Impede que o e-mail abra/feche ao clicar na lixeira
        
        Swal.fire({
            title: 'Apagar este e-mail?',
            text: "Ele será removido PERMANENTEMENTE da sua conta oficial na Hostinger!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e53e3e',
            cancelButtonColor: '#2d3748',
            confirmButtonText: 'Sim, apagar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        Swal.fire('Erro', 'Sessão expirada. Faça login novamente.', 'error');
                        return;
                    }

                    // Forçamos o envio do crachá na requisição DELETE
                    await api.delete(`/emails/${uid}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    // Remove da tela na mesma hora sem precisar recarregar o servidor
                    setEmails(emails.filter(email => email.id !== uid));
                    Swal.fire('Apagado!', 'O e-mail foi removido com sucesso.', 'success');
                } catch (error) {
                    const erroMsg = error.response?.data?.error || 'Erro desconhecido de conexão.';
                    console.error("Fofoca do Erro de Exclusão:", error);
                    Swal.fire('Erro', `Não foi possível apagar. Motivo: ${erroMsg}`, 'error');
                }
            }
        });
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    <h2>Caixa de Entrada (Webmail)</h2>
                    <p style={{ color: '#718096', marginTop: '5px' }}>
                        Últimos 15 e-mails recebidos na conta oficial.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={fetchEmails} className="btn-gold" disabled={loading}>
                        <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i> Atualizar
                    </button>
                    <Link to="/admin" className="btn-navy">Voltar</Link>
                </div>
            </div>

            <div className="admin-card" style={{ height: 'auto', padding: '0' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#718096' }}>
                        <i className="fas fa-envelope-open-text fa-bounce" style={{ fontSize: '3rem', marginBottom: '15px', color: 'var(--accent-gold)' }}></i>
                        <h3>Conectando ao Servidor de E-mail...</h3>
                        <p>Isso pode levar alguns segundos.</p>
                    </div>
                ) : (
                    <div style={{ width: '100%' }}>
                        {emails.length > 0 ? (
                            emails.map((email) => (
                                <div key={email.id} style={{ borderBottom: '1px solid #eee' }}>
                                    
                                    {/* Cabeçalho do E-mail (Clicável) */}
                                    <div 
                                        onClick={() => toggleEmail(email.id)}
                                        style={{ 
                                            padding: '20px', 
                                            cursor: 'pointer', 
                                            background: expandedId === email.id ? '#f7fafc' : 'white',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <strong style={{ color: 'var(--primary-navy)', fontSize: '1.1rem' }}>
                                                    {email.subject || '(Sem Assunto)'}
                                                </strong>
                                                <span style={{ color: '#a0aec0', fontSize: '0.9rem' }}>
                                                    {new Date(email.date).toLocaleString('pt-BR')}
                                                </span>
                                            </div>
                                            <div style={{ color: '#4a5568', fontSize: '0.95rem' }}>
                                                <i className="fas fa-user-circle" style={{ marginRight: '5px' }}></i> 
                                                De: {email.from}
                                            </div>
                                        </div>
                                        
                                        {/* AÇÕES: Lixeira e Setinha agrupadas à direita */}
                                        <div style={{ marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <button 
                                                onClick={(e) => handleDelete(email.id, e)}
                                                style={{ 
                                                    background: 'none', 
                                                    border: 'none', 
                                                    color: '#e53e3e', 
                                                    cursor: 'pointer', 
                                                    padding: '8px',
                                                    fontSize: '1.1rem',
                                                    transition: 'transform 0.2s'
                                                }}
                                                title="Apagar E-mail Definitivamente"
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                            
                                            <div style={{ color: '#cbd5e0' }}>
                                                <i className={`fas fa-chevron-${expandedId === email.id ? 'up' : 'down'}`}></i>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Corpo do E-mail (Expandido) */}
                                    {expandedId === email.id && (
                                        <div style={{ 
                                            padding: '20px', 
                                            background: '#f7fafc', 
                                            borderTop: '1px dashed #e2e8f0',
                                            color: '#2d3748',
                                            lineHeight: '1.6'
                                        }}>
                                            {/* Renderiza o HTML seguro dentro do corpo do e-mail */}
                                            <div dangerouslySetInnerHTML={{ __html: email.body || '<i>E-mail sem conteúdo em texto.</i>' }} />
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '50px', color: '#a0aec0' }}>
                                <i className="fas fa-inbox" style={{ fontSize: '3rem', marginBottom: '15px', opacity: '0.5' }}></i>
                                <h3>Caixa de Entrada Vazia</h3>
                                <p>Nenhum e-mail encontrado no servidor.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailsViewer;