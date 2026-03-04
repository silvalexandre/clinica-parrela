import React, { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import '../../styles/AdminPanel.css';
import Swal from 'sweetalert2'; // Importando SweetAlert2

const MessagesAdmin = () => {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [stats, setStats] = useState({ total: 0, respondidas: 0, pendentes: 0, contratos: 0 });
    const [alertLevel, setAlertLevel] = useState('green');
    
    // Estado do Filtro
    const [filterStatus, setFilterStatus] = useState('all');

    // Estado do Modal
    const [selectedMessage, setSelectedMessage] = useState(null);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const statsRes = await api.get('/messages/stats');
            const msgsRes = await api.get('/messages');
            
            if(statsRes.data) {
                setStats(statsRes.data.stats);
                setAlertLevel(statsRes.data.alertLevel);
            }
            if(msgsRes.data) setMessages(msgsRes.data);
        } catch (error) {
            console.error("Erro ao carregar mensagens", error);
        }
    };

    const handleStatusCycle = async (id, currentStatus) => {
        let newStatus = '';
        if (currentStatus === 'pendente') newStatus = 'respondido';
        else if (currentStatus === 'respondido') newStatus = 'contrato_fechado';
        else newStatus = 'pendente';

        try {
            await api.patch(`/messages/${id}`, { status: newStatus });
            setMessages(messages.map(msg => 
                msg.id === id ? { ...msg, status: newStatus } : msg
            ));
            fetchData();
            
            // Toast pequeno de confirmação
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
            Toast.fire({
                icon: 'success',
                title: 'Status atualizado com sucesso'
            });

        } catch (error) {
            Swal.fire('Erro', 'Não foi possível atualizar o status.', 'error');
        }
    };

    // --- NOVA FUNÇÃO DE EXCLUIR COM SWEETALERT ---
    const handleDelete = (id) => {
        // Modal de Confirmação Elegante
        Swal.fire({
            title: 'Tem certeza?',
            text: "Você não poderá reverter esta ação!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e53e3e', // Vermelho
            cancelButtonColor: '#2d3748',  // Navy
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/messages/${id}`);
                    setMessages(messages.filter(msg => msg.id !== id));
                    fetchData();
                    
                    if (selectedMessage && selectedMessage.id === id) {
                        setSelectedMessage(null);
                    }

                    Swal.fire(
                        'Excluído!',
                        'A mensagem foi removida.',
                        'success'
                    );
                } catch (error) {
                    Swal.fire('Erro!', 'Ocorreu um erro ao excluir.', 'error');
                }
            }
        });
    };

    const filteredMessages = filterStatus === 'all' 
        ? messages 
        : messages.filter(msg => msg.status === filterStatus);

    const getButtonText = (status) => {
        switch(status) {
            case 'pendente': return 'Responder';
            case 'respondido': return 'Fechar Contrato';
            case 'contrato_fechado': return 'Reabrir';
            default: return 'Ação';
        }
    };

    const getButtonColor = (status) => {
        switch(status) {
            case 'pendente': return '#2d3748';
            case 'respondido': return '#c5a47e';
            case 'contrato_fechado': return '#2d3748';
            default: return '#2d3748';
        }
    };

    const getBarColor = () => {
        if (alertLevel === 'red') return '#e53e3e';
        if (alertLevel === 'orange') return '#dd6b20';
        return '#38a169';
    };

    const getFilterStyle = (targetStatus, color) => ({
        background: color,
        cursor: 'pointer',
        opacity: filterStatus === targetStatus ? 1 : 0.4,
        transform: filterStatus === targetStatus ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.3s ease',
        border: filterStatus === targetStatus ? '2px solid #2d3748' : '2px solid transparent'
    });

    const responseRate = stats.total > 0 ? ((stats.respondidas + stats.contratos) / stats.total) * 100 : 0;

    return (
        <div className="admin-container">
             <div className="admin-header">
                <h2>Gestão de Mensagens</h2>
                <Link to="/admin" className="btn-navy">Voltar ao Menu</Link>
            </div>

            {/* GAMIFICAÇÃO */}
            <div className="gamification-wrapper">
                <div className="gamification-header">
                    <h3>Performance da Semana (Filtros)</h3>
                    {alertLevel === 'red' && <span style={{color: 'red', fontWeight: 'bold'}}>⚠ ALERTA CRÍTICO: Muitas Pendências!</span>}
                </div>
                
                <div className="stats-badges">
                    <div className="status-pill" onClick={() => setFilterStatus('all')} style={getFilterStyle('all', '#3182ce')}>
                        Total: {stats.total}
                    </div>
                    <div className="status-pill" onClick={() => setFilterStatus('respondido')} style={getFilterStyle('respondido', '#2d3748')}>
                        Respondidas: {stats.respondidas}
                    </div>
                    <div className="status-pill" onClick={() => setFilterStatus('contrato_fechado')} style={getFilterStyle('contrato_fechado', '#38a169')}>
                        Contratos: {stats.contratos}
                    </div>
                    <div className="status-pill" onClick={() => setFilterStatus('pendente')} style={getFilterStyle('pendente', alertLevel === 'red' ? '#e53e3e' : '#718096')}>
                        Pendentes: {stats.pendentes}
                    </div>
                </div>

                <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${responseRate}%`, backgroundColor: getBarColor() }}>
                        {responseRate.toFixed(0)}% Taxa de Resposta
                    </div>
                </div>
            </div>

            {/* TABELA */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <div style={{marginBottom: '15px', fontWeight: 'bold', color: '#718096'}}>
                    Exibindo: {filterStatus === 'all' ? 'Todas as Mensagens' : filterStatus.replace('_', ' ').toUpperCase()}
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee', color: 'var(--primary-navy)' }}>
                            <th style={{ padding: '15px' }}>Data</th>
                            <th>Remetente</th>
                            <th>Mensagem (Clique para Ler)</th>
                            <th>Status Atual</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMessages.length > 0 ? filteredMessages.map(msg => (
                            <tr key={msg.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '15px' }}>{new Date(msg.created_at).toLocaleDateString()}</td>
                                <td style={{ fontWeight: '600' }}>
                                    {msg.sender_name}
                                    <br/>
                                    <span style={{fontWeight:'normal', fontSize:'0.8rem', color:'#718096'}}>{msg.sender_email}</span>
                                </td>
                                
                                {/* COLUNA DA MENSAGEM CLICÁVEL */}
                                <td 
                                    onClick={() => setSelectedMessage(msg)} 
                                    style={{ color: '#4a5568', cursor: 'pointer', maxWidth: '300px' }}
                                    title="Clique para abrir mensagem completa"
                                >
                                    <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                                        <i className="fas fa-eye" style={{color: 'var(--accent-gold)'}}></i>
                                        <span style={{textDecoration: 'underline'}}>
                                            {msg.message_body ? msg.message_body.substring(0, 45) + (msg.message_body.length > 45 ? '...' : '') : 'Sem conteúdo'}
                                        </span>
                                    </div>
                                </td>

                                <td>
                                    <span style={{ 
                                        padding: '5px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                                        background: msg.status === 'pendente' ? '#fed7d7' : (msg.status === 'contrato_fechado' ? '#c6f6d5' : '#bee3f8'),
                                        color: msg.status === 'pendente' ? '#c53030' : (msg.status === 'contrato_fechado' ? '#2f855a' : '#2c5282')
                                    }}>
                                        {msg.status === 'contrato_fechado' ? 'CONTRATO FECHADO' : msg.status.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ display: 'flex', gap: '10px', alignItems: 'center', height: '100%' }}>
                                    {user.role !== 'operacional' && (
                                        <>
                                            <button 
                                                className="btn-navy" 
                                                onClick={() => handleStatusCycle(msg.id, msg.status)}
                                                style={{ 
                                                    padding: '5px 12px', 
                                                    fontSize: '0.7rem', 
                                                    backgroundColor: getButtonColor(msg.status),
                                                    minWidth: '130px',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                {getButtonText(msg.status)}
                                            </button>

                                            <button 
                                                className="btn-navy"
                                                title="Excluir Mensagem"
                                                onClick={() => handleDelete(msg.id)}
                                                style={{
                                                    padding: '5px 10px',
                                                    fontSize: '0.8rem',
                                                    backgroundColor: '#e53e3e',
                                                    minWidth: 'auto'
                                                }}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{padding:'40px', textAlign:'center', color: '#718096'}}>
                                    <i className="fas fa-inbox" style={{fontSize: '2rem', marginBottom: '10px', display: 'block'}}></i>
                                    Nenhuma mensagem encontrada neste filtro.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL DE LEITURA --- */}
            {selectedMessage && (
                <div className="modal-overlay" onClick={() => setSelectedMessage(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={() => setSelectedMessage(null)}>
                            <i className="fas fa-times"></i>
                        </button>
                        
                        <h3 style={{color: 'var(--primary-navy)', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px'}}>
                            Mensagem de {selectedMessage.sender_name}
                        </h3>
                        
                        <div style={{marginBottom: '20px'}}>
                            <p style={{fontSize: '0.9rem', color: '#718096', margin: '0 0 5px 0'}}>E-mail de Contato:</p>
                            <a href={`mailto:${selectedMessage.sender_email}`} style={{color: 'var(--accent-gold)', fontWeight: 'bold'}}>
                                {selectedMessage.sender_email}
                            </a>
                        </div>

                        <div style={{background: '#f7fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
                            <p style={{whiteSpace: 'pre-wrap', color: '#2d3748', lineHeight: '1.6'}}>
                                {selectedMessage.message_body}
                            </p>
                        </div>

                        <div style={{marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                            <button className="btn-navy" onClick={() => setSelectedMessage(null)}>Fechar</button>
                            <a href={`mailto:${selectedMessage.sender_email}`} className="btn-gold" style={{textDecoration:'none'}}>
                                Responder por E-mail
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessagesAdmin;