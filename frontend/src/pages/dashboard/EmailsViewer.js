import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import '../../styles/AdminPanel.css';
import Swal from 'sweetalert2';

const EmailsViewer = () => {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estado para controlar o modal de leitura
    const [selectedEmail, setSelectedEmail] = useState(null);

    useEffect(() => {
        loadEmails();
    }, []);

    const loadEmails = async () => {
        setLoading(true);
        try {
            const res = await api.get('/emails'); 
            setEmails(res.data);
        } catch (error) {
            console.error("Erro ao ler e-mails:", error);
            Swal.fire({
                title: 'Ops!',
                text: 'Não foi possível sincronizar com o servidor de e-mails. Tente novamente mais tarde.',
                icon: 'error',
                confirmButtonColor: '#1a202c'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Excluir E-mail?',
            text: "Esta ação apagará a mensagem definitivamente do servidor.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#b91c1c',
            cancelButtonColor: '#374151',
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/emails/${id}`);
                    setEmails(emails.filter(email => email.id !== id));
                    
                    if (selectedEmail && selectedEmail.id === id) {
                        setSelectedEmail(null); 
                    }

                    Swal.fire('Excluído!', 'O e-mail foi removido.', 'success');
                } catch (error) {
                    Swal.fire('Erro', 'Não foi possível excluir o e-mail.', 'error');
                }
            }
        });
    };

    const openWebmail = () => {
        window.open('https://mail.hostinger.com/', '_blank');
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    <h2>Caixa de Entrada Corporativa</h2>
                    <p style={{color: '#718096', fontSize: '0.9rem'}}>
                        Sincronizado com <strong>contato@parrelamedicina.com.br</strong>
                    </p>
                </div>
                <div>
                    <button onClick={loadEmails} className="btn-navy" style={{ marginRight: '10px', background: '#718096' }} disabled={loading}>
                        <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i> Atualizar
                    </button>
                    <button onClick={openWebmail} className="btn-gold" style={{ marginRight: '15px' }}>
                        <i className="fas fa-external-link-alt"></i> Acessar Webmail
                    </button>
                    <Link to="/admin" className="btn-navy">Voltar ao Menu</Link>
                </div>
            </div>

            <div className="admin-card" style={{ height: 'auto', alignItems: 'flex-start', padding: '0', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', width: '100%' }}>
                        <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: 'var(--accent-gold)', marginBottom: '15px' }}></i>
                        <p style={{ color: '#718096' }}>Sincronizando mensagens com o servidor IMAP...</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                                <th style={{ padding: '20px', color: 'var(--primary-navy)' }}>Data</th>
                                <th style={{ color: 'var(--primary-navy)' }}>Remetente</th>
                                <th style={{ color: 'var(--primary-navy)' }}>Assunto</th>
                                <th style={{ color: 'var(--primary-navy)', textAlign: 'center', width: '200px' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {emails.length > 0 ? emails.map(email => (
                                <tr key={email.id} style={{ borderBottom: '1px solid #eee', transition: '0.3s' }} className="email-row">
                                    <td style={{ padding: '20px', color: '#718096', fontSize: '0.9rem' }}>{email.date}</td>
                                    <td style={{ fontWeight: '500', color: '#2d3748' }}>
                                        {email.from.replace(/"/g, '')}
                                    </td>
                                    <td style={{ fontWeight: '600', color: 'var(--primary-navy)' }}>{email.subject}</td>
                                    <td style={{ padding: '10px 20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                                            
                                            <button 
                                                onClick={() => setSelectedEmail(email)}
                                                className="elegant-btn btn-dark" 
                                                title="Ler E-mail"
                                            >
                                                <i className="fas fa-envelope-open-text"></i>
                                            </button>

                                            <button 
                                                onClick={openWebmail}
                                                className="elegant-btn btn-dark" 
                                                title="Responder no Webmail"
                                            >
                                                <i className="fas fa-reply"></i>
                                            </button>

                                            <button 
                                                onClick={() => handleDelete(email.id)}
                                                className="elegant-btn btn-red" 
                                                title="Excluir E-mail"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>
                                        <i className="fas fa-inbox" style={{ fontSize: '2rem', marginBottom: '10px', display: 'block' }}></i>
                                        Sua caixa de entrada está vazia.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {selectedEmail && (
                <div className="modal-overlay" onClick={() => setSelectedEmail(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto'}}>
                        <button className="close-modal-btn" onClick={() => setSelectedEmail(null)}>
                            <i className="fas fa-times"></i>
                        </button>
                        
                        <div style={{ borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
                            <h2 style={{ margin: '0 0 10px 0', fontSize: '1.6rem', color: 'var(--primary-navy)' }}>
                                {selectedEmail.subject}
                            </h2>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#718096', fontSize: '0.95rem' }}>
                                <span><strong>De:</strong> {selectedEmail.from}</span>
                                <span>{selectedEmail.date}</span>
                            </div>
                        </div>

                        <div style={{ 
                            background: '#f9fafb', 
                            padding: '30px', 
                            borderRadius: '8px', 
                            border: '1px solid #e2e8f0',
                            minHeight: '200px'
                        }}>
                            {selectedEmail.html ? (
                                <div dangerouslySetInnerHTML={{ __html: selectedEmail.html }} className="email-body-content" />
                            ) : (
                                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: '#2d3748', margin: 0 }}>
                                    {selectedEmail.text}
                                </pre>
                            )}
                        </div>

                        <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                            <button className="elegant-btn btn-red" style={{width:'auto', padding:'0 20px', borderRadius:'8px'}} onClick={() => handleDelete(selectedEmail.id)}>
                                <i className="fas fa-trash" style={{marginRight: '8px', fontSize:'1rem'}}></i> <span style={{fontSize:'0.9rem', fontWeight:'600'}}>Excluir</span>
                            </button>
                            <button className="elegant-btn btn-dark" style={{width:'auto', padding:'0 20px', borderRadius:'8px'}} onClick={openWebmail}>
                                <i className="fas fa-reply" style={{marginRight: '8px', fontSize:'1rem'}}></i> <span style={{fontSize:'0.9rem', fontWeight:'600'}}>Responder via Webmail</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style jsx>{`
                .email-row:hover { 
                    background-color: #f7fafc; 
                }

                /* ESTILO BASE DO BOTÃO PREMIUM (Skeuomorphic) */
                .elegant-btn {
                    width: 48px;
                    height: 48px;
                    border-radius: 14px; /* Cantos mais arredondados estilo App */
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    
                    /* Cor solicitada para a fonte/ícone */
                    color: rgba(200, 200, 200, 0.8); 
                    font-size: 1.25rem;
                    
                    /* Sombras 3D: externa, brilho superior, sombra inferior */
                    box-shadow: 
                        0 5px 8px rgba(0,0,0,0.3), 
                        inset 0 2px 2px rgba(255,255,255,0.12), 
                        inset 0 -2px 4px rgba(0,0,0,0.35);
                }

                /* Garante centralização perfeita do ícone e efeito de baixo relevo */
                .elegant-btn i {
                    margin: 0;
                    padding: 0;
                    text-shadow: 0 -1px 1px rgba(0,0,0,0.8);
                }

                .elegant-btn:active {
                    transform: translateY(3px);
                    box-shadow: 
                        0 2px 3px rgba(0,0,0,0.3), 
                        inset 0 3px 5px rgba(0,0,0,0.6);
                }

                /* VARIANTE ESCURA (Dark/Navy) */
                .btn-dark {
                    /* Degradê sutil */
                    background: linear-gradient(180deg, #374151 0%, #1f2937 100%);
                    border: 1px solid #111827;
                }
                .btn-dark:hover { 
                    background: linear-gradient(180deg, #4b5563 0%, #293444 100%); 
                    color: rgba(255, 255, 255, 0.95); /* Clareia o ícone no hover */
                }

                /* VARIANTE VERMELHA */
                .btn-red {
                    background: linear-gradient(180deg, #991b1b 0%, #701313 100%);
                    border: 1px solid #450a0a;
                }
                .btn-red:hover { 
                    background: linear-gradient(180deg, #b91c1c 0%, #8a1717 100%); 
                    color: rgba(255, 255, 255, 0.95);
                }

                /* Correções do conteúdo HTML do email */
                .email-body-content img { max-width: 100%; height: auto; }
                .email-body-content a { color: var(--accent-gold); }
            `}</style>
        </div>
    );
};

export default EmailsViewer;