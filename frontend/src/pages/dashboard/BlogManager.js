import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import '../../styles/AdminPanel.css';
import Swal from 'sweetalert2';

const BlogManager = () => {
    const [posts, setPosts] = useState([]);
    
    // Estados do Formulário
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    
    // Controle de Imagem (Upload vs URL)
    const [imageMode, setImageMode] = useState('url'); // 'url' ou 'upload'
    const [imageUrl, setImageUrl] = useState(''); // Para o modo link
    const [selectedFile, setSelectedFile] = useState(null); // Para o modo upload
    const [previewFileUrl, setPreviewFileUrl] = useState(null); // Preview do upload
    
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            const res = await api.get('/blog');
            if(res.data) setPosts(res.data);
        } catch (error) { console.error(error); }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewFileUrl(URL.createObjectURL(file));
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);

        // Lógica de escolha da imagem
        if (imageMode === 'upload' && selectedFile) {
            formData.append('image', selectedFile); // Envia o arquivo
        } else if (imageMode === 'url' && imageUrl) {
            formData.append('image_url', imageUrl); // Envia a string
        }

        try {
            // O Backend agora aceita Multipart form data para essa rota
            await api.post('/blog', formData);
            
            Swal.fire('Sucesso', 'Post publicado com sucesso!', 'success');
            
            // Limpar tudo
            setTitle('');
            setContent('');
            setImageUrl('');
            setSelectedFile(null);
            setPreviewFileUrl(null);
            
            loadPosts();
        } catch (error) { 
            Swal.fire('Erro', 'Não foi possível criar a postagem.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>Gerenciar Blog</h2>
                <Link to="/admin" className="btn-navy">Voltar ao Menu</Link>
            </div>

            <div className="admin-card" style={{ height: 'auto', alignItems: 'flex-start', marginBottom: '30px' }}>
                <h3>Escrever Novo Artigo</h3>
                
                <form onSubmit={handleCreate} style={{ width: '100%', marginTop: '20px' }}>
                    
                    {/* Título */}
                    <input type="text" placeholder="Título do Post" className="login-input" 
                        value={title} onChange={e => setTitle(e.target.value)} required />

                    {/* SELETOR DE MODO DE IMAGEM */}
                    <div style={{marginBottom: '15px'}}>
                        <label style={{fontWeight:'bold', display:'block', marginBottom:'8px'}}>Imagem de Capa:</label>
                        <div style={{display:'flex', gap:'10px', marginBottom:'10px'}}>
                            <button type="button" 
                                onClick={() => setImageMode('url')}
                                style={{
                                    padding: '8px 15px', 
                                    border: '1px solid #ccc', 
                                    borderRadius:'4px',
                                    background: imageMode === 'url' ? 'var(--primary-navy)' : '#fff',
                                    color: imageMode === 'url' ? '#fff' : '#333',
                                    cursor: 'pointer'
                                }}>
                                <i className="fas fa-link"></i> Link da Internet
                            </button>
                            <button type="button" 
                                onClick={() => setImageMode('upload')}
                                style={{
                                    padding: '8px 15px', 
                                    border: '1px solid #ccc', 
                                    borderRadius:'4px',
                                    background: imageMode === 'upload' ? 'var(--primary-navy)' : '#fff',
                                    color: imageMode === 'upload' ? '#fff' : '#333',
                                    cursor: 'pointer'
                                }}>
                                <i className="fas fa-upload"></i> Upload do PC
                            </button>
                        </div>

                        {/* INPUT: MODO URL */}
                        {imageMode === 'url' && (
                            <input type="text" placeholder="Cole o link da imagem aqui (https://...)" className="login-input" 
                                value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                        )}

                        {/* INPUT: MODO UPLOAD */}
                        {imageMode === 'upload' && (
                            <div style={{border: '2px dashed #cbd5e0', padding: '15px', borderRadius: '8px', textAlign: 'center', background: '#f7fafc'}}>
                                {previewFileUrl ? (
                                    <div style={{position: 'relative', display:'inline-block'}}>
                                        <img src={previewFileUrl} alt="Preview" style={{height:'100px', borderRadius:'4px'}} />
                                        <button type="button" onClick={() => {setSelectedFile(null); setPreviewFileUrl(null)}} 
                                            style={{position:'absolute', top:'-5px', right:'-5px', background:'red', color:'white', border:'none', borderRadius:'50%', width:'20px', height:'20px', cursor:'pointer'}}>x</button>
                                    </div>
                                ) : (
                                    <>
                                        <input type="file" accept="image/*" onChange={handleFileChange} />
                                        <p style={{fontSize:'0.8rem', color:'#718096', marginTop:'5px'}}>Recomendado: JPG ou PNG (Max 5MB)</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Conteúdo */}
                    <textarea placeholder="Conteúdo do Artigo..." className="login-input" rows="8" style={{resize:'vertical'}}
                        value={content} onChange={e => setContent(e.target.value)} required></textarea>
                    
                    <button className="btn-gold" style={{ width: '100%', opacity: loading ? 0.7 : 1 }} disabled={loading}>
                        {loading ? 'Publicando...' : 'Publicar Artigo'}
                    </button>
                </form>
            </div>

            <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h3>Artigos Publicados</h3>
                <ul style={{ listStyle: 'none', marginTop: '20px', padding: 0 }}>
                    {posts.length > 0 ? posts.map(post => (
                        <li key={post.id} style={{ borderBottom: '1px solid #eee', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                                {/* Miniatura da imagem */}
                                {post.image_url && (
                                    <img src={post.image_url} alt="Capa" style={{width:'60px', height:'60px', objectFit:'cover', borderRadius:'4px'}} />
                                )}
                                <div>
                                    <h4 style={{margin: 0, color: 'var(--primary-navy)'}}>{post.title}</h4>
                                    <span style={{fontSize: '0.8rem', color: '#718096'}}>Publicado em: {new Date(post.published_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <button className="btn-navy" style={{ padding: '8px 15px', fontSize: '0.8rem' }}>Editar</button>
                        </li>
                    )) : <p>Nenhum artigo encontrado.</p>}
                </ul>
            </div>
        </div>
    );
};

export default BlogManager;