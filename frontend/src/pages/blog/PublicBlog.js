import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/PublicSite.css';

const PublicBlog = () => {
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Carrega todos os posts
        api.get('/blog').then(res => setPosts(res.data)).catch(console.error);
        window.scrollTo(0, 0);
    }, []);

    return (
        <div id="blog-page">
            {/* Header Simplificado (Reutilizando estilos do PublicSite) */}
            <header>
                <div className="container">
                    <nav>
                        <Link to="/" className="logo">Dr. Rômulo <span>Parrela</span></Link>
                        <div className="nav-links">
                            <Link to="/">Voltar ao Início</Link>
                            <Link to="/#contato" className="btn-contato-header">Contato</Link>
                        </div>
                    </nav>
                </div>
            </header>

            <section className="hero" style={{ height: '50vh', minHeight: '400px' }}>
                <div className="container">
                    <h1>Blog & Notícias</h1>
                    <p>Fique por dentro das novidades em medicina ocupacional.</p>
                </div>
            </section>

            <section className="blog-section">
                <div className="container">
                    <div className="blog-grid">
                        {posts.length > 0 ? posts.map(post => (
                            <article key={post.id} className="blog-card" style={{cursor: 'pointer'}} onClick={() => navigate(`/blog/${post.id}`)}>
                                <div className="blog-img">
                                    <img 
                                        src={post.image_url || 'https://via.placeholder.com/400x200?text=Sem+Imagem'} 
                                        alt={post.title} 
                                    />
                                </div>
                                <div className="blog-content">
                                    <span className="blog-date">{new Date(post.published_at).toLocaleDateString()}</span>
                                    <h3>{post.title}</h3>
                                    <p>{post.content ? post.content.substring(0, 100) + '...' : ''}</p>
                                    <span className="blog-link">Ler Artigo <i className="fas fa-arrow-right"></i></span>
                                </div>
                            </article>
                        )) : (
                            <p style={{gridColumn: '1/-1', textAlign: 'center', color: '#718096'}}>Carregando artigos...</p>
                        )}
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

export default PublicBlog;