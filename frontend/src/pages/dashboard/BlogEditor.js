import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import '../../styles/AdminPanel.css';

const BlogEditor = () => {
    const { id } = useParams(); // Se tiver ID na URL, é modo de edição
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Estado inicial dos campos de texto
    const [formData, setFormData] = useState({ title: '', content: '' });
    // Estado para a imagem (separado porque é um arquivo)
    const [image, setImage] = useState(null);

    // Se for modo de edição, busca os dados atuais no banco para preencher a tela
    useEffect(() => {
        if (id) {
            const loadPost = async () => {
                try {
                    const res = await api.get(`/blog/${id}`);
                    setFormData({ title: res.data.title, content: res.data.content });
                } catch (err) {
                    console.error("Erro ao carregar post:", err);
                    Swal.fire('Erro', 'Não foi possível carregar os dados originais do post.', 'error');
                }
            };
            loadPost();
        }
    }, [id]);

   const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('content', formData.content);
        if (image) {
            data.append('image', image);
        }

        // 1. Pegamos o crachá do bolso e verificamos se ele realmente existe
        const token = localStorage.getItem('token');
        if (!token) {
            Swal.fire('Sessão Expirada', 'O seu navegador perdeu o login. Por favor, saia e entre novamente.', 'error');
            setLoading(false);
            return;
        }

        try {
            // 2. Pegamos a URL base dinamicamente (funciona no Localhost e na Vercel)
            const baseURL = api.defaults.baseURL;
            const endpoint = id ? `${baseURL}/blog/${id}` : `${baseURL}/blog`;
            const method = id ? 'PUT' : 'POST';

            // 3. A FORÇA BRUTA: Usamos o 'fetch' nativo do navegador, ignorando o Axios
            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`
                    // O navegador coloca o Content-Type do FormData automaticamente!
                },
                body: data
            });

            // Lemos a resposta do servidor
            const result = await response.json();

            if (!response.ok) {
                // Se o servidor deu erro, jogamos para o catch com a mensagem exata
                throw new Error(result.error || 'Erro desconhecido no servidor.');
            }

            // Se chegou aqui, é sucesso absoluto!
            Swal.fire({ title: 'Sucesso!', text: result.message, icon: 'success', confirmButtonColor: '#1a202c' });
            navigate('/admin/blog');

        } catch (err) {
            console.error("Fofoca do Erro Nativo:", err.message);
            Swal.fire('Falha ao Salvar', `Motivo: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>{id ? 'Editar Artigo' : 'Nova Postagem no Blog'}</h2>
                <Link to="/admin/blog" className="btn-navy">Cancelar e Voltar</Link>
            </div>

            <div className="admin-card" style={{ height: 'auto', alignItems: 'flex-start' }}>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px', width: '100%' }}>
                    
                    <div className="form-group">
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Título da Postagem</label>
                        <input 
                            type="text" 
                            placeholder="Digite um título chamativo..." 
                            className="login-input"
                            value={formData.title} 
                            onChange={e => setFormData({ ...formData, title: e.target.value })} 
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Conteúdo do Artigo</label>
                        <textarea 
                            placeholder="Escreva o conteúdo completo aqui..." 
                            className="login-input" 
                            style={{ height: '350px', padding: '15px', lineHeight: '1.6', resize: 'vertical' }}
                            value={formData.content} 
                            onChange={e => setFormData({ ...formData, content: e.target.value })} 
                            required 
                        />
                    </div>
                    
                    <div style={{ background: '#f7fafc', padding: '20px', borderRadius: '8px', border: '1px dashed #cbd5e0' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                            {id ? 'Deseja trocar a imagem de capa? (Opcional)' : 'Selecione a Imagem de Capa:'}
                        </label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={e => setImage(e.target.files[0])} 
                        />
                        <p style={{ fontSize: '0.85rem', color: '#718096', marginTop: '10px' }}>
                            {id ? 'Se você não selecionar nenhum arquivo, a imagem atual será mantida no site.' : 'Formatos aceitos: JPG, PNG. Tamanho ideal: 1200x600px.'}
                        </p>
                    </div>

                    <button 
                        type="submit" 
                        className="btn-gold" 
                        style={{ marginTop: '10px', fontSize: '1.1rem', padding: '15px' }} 
                        disabled={loading}
                    >
                        {loading ? 'PROCESSANDO...' : (id ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR NO BLOG')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BlogEditor;