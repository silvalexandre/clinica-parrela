import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link, useParams } from 'react-router-dom';
import '../../styles/PublicSite.css';

const SinglePost = () => {
    const { id } = useParams(); // Pega o ID da URL
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPost = async () => {
            try {
                const res = await api.get(`/blog/${id}`);
                setPost(res.data);
            } catch (error) {
                console.error("Erro ao carregar post");
            } finally {
                setLoading(false);
            }
        };
        loadPost();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) return <div style={{padding:'100px', textAlign:'center'}}>Carregando artigo...</div>;
    if (!post) return <div style={{padding:'100px', textAlign:'center'}}>Artigo não encontrado.</div>;

    return (
        <div>
            <header>
                <div className="container">
                    <nav>
                        <Link to="/" className="logo">Dr. Rômulo <span>Parrela</span></Link>
                        <div className="nav-links">
                            <Link to="/">Início</Link>
                            <Link to="/blog" style={{color:'var(--accent-gold)'}}>Blog</Link>
                            <Link to="/#contato" className="btn-contato-header">Contato</Link>
                        </div>
                    </nav>
                </div>
            </header>

            {/* Imagem de Capa do Post */}
            <div style={{
                height: '60vh', 
                background: post.image_url ? `url(${post.image_url}) no-repeat center center/cover` : 'var(--primary-navy)',
                position: 'relative',
                marginTop: '80px'
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(26, 32, 44, 0.7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="container" style={{textAlign: 'center', color: 'white'}}>
                        <span style={{background:'var(--accent-gold)', padding:'5px 15px', borderRadius:'20px', fontSize:'0.8rem', textTransform:'uppercase'}}>
                            {new Date(post.published_at).toLocaleDateString()}
                        </span>
                        <h1 style={{fontSize: '3rem', margin: '20px 0', color: 'white'}}>{post.title}</h1>
                    </div>
                </div>
            </div>

            {/* Conteúdo do Post */}
            <section style={{padding: '80px 0', background: 'white'}}>
                <div className="container" style={{maxWidth: '800px'}}>
                    <div style={{
                        lineHeight: '2', 
                        fontSize: '1.1rem', 
                        color: 'var(--text-dark)',
                        whiteSpace: 'pre-wrap' // Preserva quebras de linha do banco
                    }}>
                        {post.content}
                    </div>

                    <div style={{marginTop: '60px', borderTop: '1px solid #eee', paddingTop: '30px'}}>
                        <Link to="/blog" className="btn btn-navy">
                            <i className="fas fa-arrow-left"></i> Voltar para o Blog
                        </Link>
                    </div>
                </div>
            </section>

            <footer style={{ backgroundColor: 'var(--primary-navy)', color: '#718096', padding: '60px 0 30px', borderTop: '3px solid var(--accent-gold)' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem' }}>© 2026 Parrela Medicina Ocupacional.</p>
                </div>
            </footer>
        </div>
    );
};

export default SinglePost;