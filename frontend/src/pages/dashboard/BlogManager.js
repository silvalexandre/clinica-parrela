import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../../styles/AdminPanel.css';

const BlogManager = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/blog');
            setPosts(response.data || []); // Garante que será um array mesmo se vier vazio
        } catch (error) {
            console.error("Erro ao carregar postagens do blog:", error);
            Swal.fire('Erro', 'Não foi possível carregar as postagens.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Você tem certeza?',
            text: "Esta postagem será removida permanentemente do site!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e53e3e',
            cancelButtonColor: '#2d3748',
            confirmButtonText: 'Sim, excluir post',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // A FORÇA BRUTA: Pegamos o crachá do bolso
                    const token = localStorage.getItem('token');
                    
                    if (!token) {
                        Swal.fire('Erro', 'Sessão expirada. Faça login novamente.', 'error');
                        return;
                    }

                    // Forçamos o Axios a enviar o cabeçalho de segurança
                    await api.delete(`/blog/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    // Remove o post da tela sem precisar recarregar a página
                    setPosts(posts.filter(post => post.id !== id));
                    Swal.fire('Excluído!', 'A postagem foi removida com sucesso.', 'success');
                } catch (error) {
                    // O fofoqueiro de erros para a exclusão
                    const mensagemErro = error.response?.data?.error || 'Erro desconhecido de conexão.';
                    console.error("Fofoca do Erro de Exclusão:", error.response || error);
                    Swal.fire('Erro', `Houve um problema ao excluir. Motivo: ${mensagemErro}`, 'error');
                }
            }
        });
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>Gerenciar Conteúdo do Blog</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Link to="/admin/blog/novo" className="btn-gold">
                        <i className="fas fa-plus" style={{ marginRight: '5px' }}></i> Nova Postagem
                    </Link>
                    <Link to="/admin" className="btn-navy">Voltar ao Menu</Link>
                </div>
            </div>

            <div className="admin-card" style={{ height: 'auto' }}>
                <div style={{ marginBottom: '20px' }}>
                    <h3>Artigos Publicados</h3>
                    <p style={{ color: '#718096', fontSize: '0.9rem' }}>
                        Aqui você pode visualizar, editar ou remover os artigos que aparecem na página pública.
                    </p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px', color: '#718096' }}>
                        <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
                        <p>Carregando postagens...</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', color: 'var(--primary-navy)' }}>
                                    <th style={{ padding: '12px 10px' }}>Título da Postagem</th>
                                    <th>Data de Publicação</th>
                                    <th style={{ textAlign: 'right', paddingRight: '10px' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.length > 0 ? (
                                    posts.map(post => (
                                        <tr key={post.id} style={{ borderBottom: '1px solid #eee', transition: 'background-color 0.2s' }}>
                                            <td style={{ padding: '15px 10px', fontWeight: '500' }}>
                                                {post.title}
                                            </td>
                                            <td style={{ color: '#4a5568' }}>
                                                {/* Fallback de segurança para a data */}
                                                {post.published_at 
                                                    ? new Date(post.published_at).toLocaleDateString('pt-BR') 
                                                    : 'Data indisponível'}
                                            </td>
                                            <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '10px' }}>
                                                <Link 
                                                    to={`/blog/${post.id}`} 
                                                    className="btn-navy" 
                                                    style={{ minWidth: '40px', padding: '8px' }}
                                                    title="Ver no site"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </Link>

                                                <Link 
                                                    to={`/admin/blog/editar/${post.id}`} 
                                                    className="btn-gold" 
                                                    style={{ minWidth: '40px', padding: '8px' }}
                                                    title="Editar conteúdo"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </Link>

                                                <button 
                                                    onClick={() => handleDelete(post.id)} 
                                                    className="btn-navy" 
                                                    style={{ 
                                                        background: '#e53e3e', 
                                                        minWidth: '40px', 
                                                        padding: '8px',
                                                        border: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                    title="Excluir postagem"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                                            <i className="fas fa-newspaper" style={{ fontSize: '2rem', marginBottom: '10px', opacity: '0.5' }}></i>
                                            <br />
                                            Nenhuma postagem encontrada. Comece criando uma nova!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogManager;