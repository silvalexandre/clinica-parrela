import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import '../../styles/AdminPanel.css';

const SiteConfig = () => {
    const [config, setConfig] = useState({
        phone: '', address: '', instagram_url: '', linkedin_url: '', whatsapp_url: ''
    });

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const res = await api.get('/config');
            if (res.data) setConfig(res.data);
        } catch (error) {
            console.error("Erro ao carregar configs, usando padrão.");
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put('/config', config);
            alert('Configurações atualizadas com sucesso!');
        } catch (error) {
            alert('Erro ao atualizar configurações.');
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>Configurações do Site</h2>
                <Link to="/admin" className="btn-navy">Voltar ao Menu</Link>
            </div>

            <div className="admin-card" style={{ height: 'auto', alignItems: 'flex-start' }}>
                <p style={{marginBottom: '20px', color: '#718096'}}>Estas informações serão refletidas instantaneamente no site público.</p>
                
                <form onSubmit={handleUpdate} style={{ width: '100%' }}>
                    <div style={{marginBottom: '15px'}}>
                        <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Telefone de Contato</label>
                        <input type="text" className="login-input" value={config.phone} onChange={e => setConfig({...config, phone: e.target.value})} placeholder="(38) 99999-9999" />
                    </div>
                    
                    <div style={{marginBottom: '15px'}}>
                        <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Endereço Completo</label>
                        <input type="text" className="login-input" value={config.address} onChange={e => setConfig({...config, address: e.target.value})} placeholder="Rua, Número - Bairro, Cidade - UF" />
                    </div>
                    
                    <h3 style={{marginTop: '30px', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>Redes Sociais</h3>

                    <div style={{marginBottom: '15px'}}>
                        <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Link do Instagram</label>
                        <input type="text" className="login-input" value={config.instagram_url} onChange={e => setConfig({...config, instagram_url: e.target.value})} placeholder="https://instagram.com/..." />
                    </div>
                    
                    <div style={{marginBottom: '15px'}}>
                        <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Link do LinkedIn</label>
                        <input type="text" className="login-input" value={config.linkedin_url} onChange={e => setConfig({...config, linkedin_url: e.target.value})} placeholder="https://linkedin.com/..." />
                    </div>
                    
                    <div style={{marginBottom: '15px'}}>
                        <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Link do WhatsApp (API)</label>
                        <input type="text" className="login-input" value={config.whatsapp_url} onChange={e => setConfig({...config, whatsapp_url: e.target.value})} placeholder="https://wa.me/5538..." />
                    </div>

                    <button className="btn-gold" style={{ width: '100%', marginTop: '20px', fontSize: '1rem' }}>Salvar Todas as Alterações</button>
                </form>
            </div>
        </div>
    );
};

export default SiteConfig;