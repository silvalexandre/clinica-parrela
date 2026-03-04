import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import '../../styles/AdminPanel.css';
import Swal from 'sweetalert2';

const FacilitiesManager = () => {
    const [facilities, setFacilities] = useState([]);
    const [caption, setCaption] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadFacilities();
    }, []);

    const loadFacilities = async () => {
        try {
            const res = await api.get('/facilities');
            setFacilities(res.data || []);
        } catch (error) {
            console.error("Erro ao carregar fotos");
        }
    };

    // Gerencia a seleção do arquivo e cria o preview
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // Cria URL temporária para mostrar na tela
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        
        if (!selectedFile) {
            Swal.fire('Atenção', 'Selecione uma imagem do seu computador.', 'warning');
            return;
        }

        setUploading(true);
        
        // Para enviar arquivos, usamos FormData ao invés de JSON
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('caption', caption);

        try {
            // O header 'Content-Type': 'multipart/form-data' é gerado automaticamente pelo axios quando passamos formData
            await api.post('/facilities', formData);
            
            Swal.fire({
                title: 'Sucesso!',
                text: 'Foto adicionada à galeria.',
                icon: 'success',
                confirmButtonColor: '#1a202c'
            });

            // Limpar formulário
            setSelectedFile(null);
            setPreviewUrl(null);
            setCaption('');
            setUploading(false);
            
            // Recarregar lista
            loadFacilities();

        } catch (error) {
            setUploading(false);
            Swal.fire('Erro', 'Falha ao fazer upload da imagem.', 'error');
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Excluir foto?',
            text: "Ela será removida do site.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e53e3e',
            cancelButtonColor: '#2d3748',
            confirmButtonText: 'Sim, excluir'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/facilities/${id}`);
                    setFacilities(facilities.filter(f => f.id !== id));
                    Swal.fire('Excluído!', 'Foto removida.', 'success');
                } catch (error) {
                    Swal.fire('Erro', 'Não foi possível excluir.', 'error');
                }
            }
        });
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>Galeria de Instalações</h2>
                <Link to="/admin" className="btn-navy">Voltar ao Menu</Link>
            </div>

            {/* CARD DE UPLOAD */}
            <div className="admin-card" style={{ height: 'auto', alignItems: 'flex-start', marginBottom: '30px' }}>
                <h3>Adicionar Nova Foto</h3>
                <p style={{color:'#718096', marginBottom:'20px'}}>Selecione uma foto do seu computador para exibir no site.</p>
                
                <form onSubmit={handleUpload} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    {/* Área de Seleção de Arquivo */}
                    <div style={{border: '2px dashed #cbd5e0', padding: '20px', borderRadius: '8px', textAlign: 'center', background: '#f7fafc'}}>
                        {previewUrl ? (
                            <div style={{position: 'relative', display: 'inline-block'}}>
                                <img src={previewUrl} alt="Preview" style={{maxHeight: '200px', borderRadius: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} />
                                <button type="button" onClick={() => {setSelectedFile(null); setPreviewUrl(null)}} 
                                    style={{position: 'absolute', top: '-10px', right: '-10px', background: '#e53e3e', color:'white', border:'none', borderRadius:'50%', width:'30px', height:'30px', cursor:'pointer'}}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        ) : (
                            <>
                                <i className="fas fa-cloud-upload-alt" style={{fontSize: '3rem', color: '#cbd5e0', marginBottom: '10px'}}></i>
                                <p style={{color: '#718096'}}>Clique para selecionar ou arraste uma imagem</p>
                            </>
                        )}
                        
                        {/* Input Invisível cobrindo a área (truque para clicar em qualquer lugar) ou botão abaixo */}
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{marginTop: '15px', display: previewUrl ? 'none' : 'block', margin: '10px auto'}}
                        />
                    </div>

                    <input 
                        type="text" 
                        placeholder="Legenda (ex: Sala de Raio-X Digital)" 
                        className="login-input" 
                        value={caption} 
                        onChange={e => setCaption(e.target.value)} 
                    />
                    
                    <button type="submit" className="btn-gold" disabled={uploading} style={{opacity: uploading ? 0.7 : 1}}>
                        {uploading ? <><i className="fas fa-spinner fa-spin"></i> Enviando...</> : 'Salvar na Galeria'}
                    </button>
                </form>
            </div>

            {/* GRID DE FOTOS */}
            <h3 style={{marginBottom: '20px', color: 'var(--primary-navy)'}}>Fotos Atuais no Site</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                {facilities.length > 0 ? facilities.map(item => (
                    <div key={item.id} style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                        <div style={{height: '180px', overflow: 'hidden', borderRadius: '4px', marginBottom: '10px'}}>
                            <img src={item.image_url} alt={item.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <p style={{ fontWeight: 'bold', color: 'var(--primary-navy)', fontSize: '0.9rem', marginBottom: '10px' }}>
                            {item.caption || 'Sem legenda'}
                        </p>
                        <button 
                            className="btn-navy" 
                            onClick={() => handleDelete(item.id)}
                            style={{ fontSize: '0.8rem', background: '#e53e3e', width: '100%' }}
                        >
                            <i className="fas fa-trash"></i> Excluir Foto
                        </button>
                    </div>
                )) : (
                    <p style={{color: '#718096'}}>Nenhuma foto cadastrada ainda.</p>
                )}
            </div>
        </div>
    );
};

export default FacilitiesManager;