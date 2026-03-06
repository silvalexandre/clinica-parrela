import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../../styles/AdminPanel.css';

const SiteConfig = () => {
    const [config, setConfig] = useState({
        phone: '', 
        address: '', 
        instagram_url: '', 
        linkedin_url: '', 
        whatsapp_url: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const res = await api.get('/config');
            if (res.data && Object.keys(res.data).length > 0) {
                // Filtramos apenas o que o nosso estado gerencia
                setConfig({
                    phone: res.data.phone || '',
                    address: res.data.address || '',
                    instagram_url: res.data.instagram_url || '',
                    linkedin_url: res.data.linkedin_url || '',
                    whatsapp_url: res.data.whatsapp_url || ''
                });
            }
        } catch (error) {
            console.error("Erro ao carregar configurações do servidor.");
        } finally {
            setLoading(false);
        }
    };

  const handleUpdate = async (e) => {
        e.preventDefault();
        
        // 1. Pegamos o crachá direto do bolso
        const token = localStorage.getItem('token');
        
        if (!token) {
            Swal.fire('Sessão Expirada', 'Por favor, faça login novamente.', 'error');
            return;
        }

        try {
            // 2. Forçamos o envio do crachá na requisição PUT
            await api.put('/config', config, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Sucesso!
            Swal.fire({
                title: 'Sucesso!',
                text: 'Configurações do site atualizadas com sucesso.',
                icon: 'success',
                confirmButtonColor: '#1a202c'
            });
            
        } catch (error) {
            // 3. O Fofoqueiro: Captura o erro exato do servidor
            const mensagemErro = error.response?.data?.error || error.message || 'Erro desconhecido de conexão.';
            console.error("Fofoca do Erro de Configuração:", error.response || error);
            
            Swal.fire('Falha ao Salvar', `Motivo: ${mensagemErro}`, 'error');
        }
    };

    if (loading) return <div className="admin-container">Carregando painel de configurações...</div>;

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>Configurações do Site</h2>
                <Link to="/admin" className="btn-navy">Voltar ao Menu</Link>
            </div>

            <div className="admin-card" style={{ height: 'auto', alignItems: 'flex-start' }}>
                <p style={{ marginBottom: '20px', color: '#718096' }}>
                    Estas informações serão refletidas instantaneamente no site público (rodapé e contato).
                </p>
                
                <form onSubmit={handleUpdate} style={{ width: '100%' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Telefone de Contato</label>
                        <input 
                            type="text" 
                            className="login-input" 
                            value={config.phone} 
                            onChange={e => setConfig({ ...config, phone: e.target.value })} 
                            placeholder="(38) 99999-9999" 
                        />
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Endereço Completo</label>
                        <input 
                            type="text" 
                            className="login-input" 
                            value={config.address} 
                            onChange={e => setConfig({ ...config, address: e.target.value })} 
                            placeholder="Rua, Número - Bairro, Cidade - UF" 
                        />
                    </div>
                    
                    <h3 style={{ marginTop: '30px', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Redes Sociais</h3>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Link do Instagram</label>
                        <input 
                            type="text" 
                            className="login-input" 
                            value={config.instagram_url} 
                            onChange={e => setConfig({ ...config, instagram_url: e.target.value })} 
                            placeholder="https://instagram.com/..." 
                        />
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Link do LinkedIn</label>
                        <input 
                            type="text" 
                            className="login-input" 
                            value={config.linkedin_url} 
                            onChange={e => setConfig({ ...config, linkedin_url: e.target.value })} 
                            placeholder="https://linkedin.com/..." 
                        />
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Link do WhatsApp (URL API)</label>
                        <input 
                            type="text" 
                            className="login-input" 
                            value={config.whatsapp_url} 
                            onChange={e => setConfig({ ...config, whatsapp_url: e.target.value })} 
                            placeholder="https://wa.me/5538..." 
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn-gold" 
                        style={{ width: '100%', marginTop: '20px', fontSize: '1rem', cursor: 'pointer' }}
                    >
                        Salvar Todas as Alterações
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SiteConfig;