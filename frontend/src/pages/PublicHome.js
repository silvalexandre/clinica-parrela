import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/PublicSite.css';
import Swal from 'sweetalert2';

const PublicHome = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ nome: '', email: '', mensagem: '' });
    const [showBackToTop, setShowBackToTop] = useState(false);
    
    // Dados Dinâmicos
    const [facilities, setFacilities] = useState([]); 
    const [blogPosts, setBlogPosts] = useState([]);
    const [lightboxImage, setLightboxImage] = useState(null);
    const [config, setConfig] = useState({
        phone: '', address: '', instagram_url: '', linkedin_url: '', whatsapp_url: ''
    });

    const loadData = async () => {
        try {
            const configRes = await api.get('/config');
            if (configRes.data && !Array.isArray(configRes.data)) setConfig(configRes.data);

            const facRes = await api.get('/facilities');
            // BLINDAGEM: Só aceita se for realmente uma lista (Array)
            if (Array.isArray(facRes.data)) {
                setFacilities(facRes.data);
            } else {
                setFacilities([]);
            }

            const blogRes = await api.get('/blog');
            // BLINDAGEM: Só aceita se for realmente uma lista (Array)
            if (Array.isArray(blogRes.data)) {
                setBlogPosts(blogRes.data.slice(0, 3));
            } else {
                setBlogPosts([]);
            }
        } catch (error) {
            console.error("Erro ao carregar dados dinâmicos:", error);
            setFacilities([]);
            setBlogPosts([]);
        }
    };

    const handleNextImage = useCallback((e) => {
        if(e) e.stopPropagation();
        if(!lightboxImage || !Array.isArray(facilities) || facilities.length === 0) return;
        const currentIndex = facilities.findIndex(item => item.id === lightboxImage.id);
        const nextIndex = (currentIndex + 1) % facilities.length;
        setLightboxImage(facilities[nextIndex]);
    }, [lightboxImage, facilities]);

    const handlePrevImage = useCallback((e) => {
        if(e) e.stopPropagation();
        if(!lightboxImage || !Array.isArray(facilities) || facilities.length === 0) return;
        const currentIndex = facilities.findIndex(item => item.id === lightboxImage.id);
        const prevIndex = (currentIndex - 1 + facilities.length) % facilities.length;
        setLightboxImage(facilities[prevIndex]);
    }, [lightboxImage, facilities]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) setShowBackToTop(true);
            else setShowBackToTop(false);
        };
        
        const handleKeyDown = (e) => {
            if (!lightboxImage) return;
            if (e.key === 'Escape') setLightboxImage(null);
            if (e.key === 'ArrowRight') handleNextImage(e);
            if (e.key === 'ArrowLeft') handlePrevImage(e);
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('keydown', handleKeyDown);
        
        loadData();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [lightboxImage, handleNextImage, handlePrevImage]);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submit-btn');
        if(submitBtn) submitBtn.innerText = 'Enviando...';

        try {
            await api.post('/public/contact', formData);
            Swal.fire({
                title: 'Mensagem Enviada!',
                text: 'Agradecemos o contato.',
                icon: 'success',
                confirmButtonColor: '#1a202c',
                background: '#fff'
            });
            setFormData({ nome: '', email: '', mensagem: '' });
        } catch (error) {
            Swal.fire('Ops!', 'Houve um erro ao enviar.', 'error');
        } finally {
            if(submitBtn) submitBtn.innerText = 'Enviar Mensagem';
        }
    };

    const displayPhone = config.phone || '(38) 99999-9999';
    const displayAddress = config.address || 'R. Santos Dumont, 158 - Centro, Janaúba - MG';
    
    const mapEmbedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3824.789156488344!2d-43.30843472529949!3d-15.804153023225883!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7509497e883f3e7%3A0x6d8f8a85f67b5f1a!2sR.%20Santos%20Dumont%2C%20158%20-%20Centro%2C%20Jana%C3%BAba%20-%20MG%2C%2039440-000!5e0!3m2!1spt-BR!2sbr!4v1715456789012!5m2!1spt-BR!2sbr?q=${encodeURIComponent(displayAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    const mapGpsUrl = `https://maps.app.goo.gl/uX3L5jP8zS6w8v8F7?q=${encodeURIComponent(displayAddress)}`;

    return (
        <div id="home">
            <div id="backToTop" onClick={scrollToTop} style={{ opacity: showBackToTop ? 1 : 0, visibility: showBackToTop ? 'visible' : 'hidden' }}>
                <i className="fas fa-chevron-up"></i>
            </div>

            <header>
                <div className="top-bar">
                    <div className="container">
                        <div className="top-bar-info">
                            <span><i className="fas fa-phone"></i> {displayPhone}</span>
                            <span><i className="fas fa-map-marker-alt"></i> {displayAddress}</span>
                        </div>
                        <div className="top-bar-social">
                            {config.instagram_url && <a href={config.instagram_url} target="_blank" rel="noopener noreferrer" title="Instagram"><i className="fab fa-instagram"></i></a>}
                            {config.linkedin_url && <a href={config.linkedin_url} target="_blank" rel="noopener noreferrer" title="LinkedIn"><i className="fab fa-linkedin-in"></i></a>}
                            {config.whatsapp_url && <a href={config.whatsapp_url} target="_blank" rel="noopener noreferrer" title="WhatsApp"><i className="fab fa-whatsapp"></i></a>}
                        </div>
                    </div>
                </div>

                <div className="container">
                    <nav>
                        <span className="logo" style={{cursor: 'pointer'}} onClick={scrollToTop}>Dr. Rômulo <span>Parrela</span></span>
                        <div className="nav-links">
                            <button onClick={() => scrollToSection('sobre')}>Sobre Nós</button>
                            <button onClick={() => scrollToSection('servicos')}>Serviços</button>
                            <button onClick={() => scrollToSection('instalacoes')}>Instalações</button>
                            <button onClick={() => scrollToSection('blog')}>Blog</button>
                            <button onClick={() => scrollToSection('localizacao')}>Onde Estamos</button>
                            <button onClick={() => scrollToSection('contato')} className="btn-contato-header">Contato</button>
                        </div>
                    </nav>
                </div>
            </header>

            <section className="hero">
                <div className="container">
                    <h1>Medicina Ocupacional com<br />Visão Estratégica</h1>
                    <p>Protegendo o maior patrimônio da sua empresa: as pessoas.</p>
                    <button onClick={() => scrollToSection('servicos')} className="btn btn-gold">Nossas Soluções</button>
                </div>
            </section>

            <section id="sobre">
                <div className="container">
                    <div className="section-header">
                        <h2>Nossa Trajetória</h2>
                        <div className="divider"></div>
                    </div>
                    <div className="about-grid">
                        <div className="about-text">
                            <h3>O Legado de Confiança</h3>
                            <p>O nome Dr. Rômulo Parrela é sinônimo de ética e excelência médica no Norte de Minas. Sua trajetória estabeleceu os alicerces de confiança sobre os quais nossa clínica se sustenta.</p>
                            <h3 style={{ marginTop: '30px' }}>A Força da Renovação</h3>
                            <p>Sob a liderança da Dra. Larissa Parrela, unimos a experiência herdada à visão estratégica contemporânea e uma equipe técnica extremamente qualificada, transformando a tradição em eficiência e confiança.</p>
                        </div>
                        <div className="about-img">
                            <img src="https://images.unsplash.com/photo-1559839734-2b71f1e3b778?auto=format&fit=crop&q=80&w=800" alt="Equipe Médica Parrela" />
                        </div>
                    </div>
                </div>
            </section>

            <section id="servicos" className="services-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Soluções Integradas</h2>
                        <div className="divider"></div>
                    </div>
                    <div className="services-grid">
                        <div className="service-card">
                            <h3>Exames Ocupacionais</h3>
                            <ul className="service-list">
                                <li><i className="fas fa-check"></i> <div><strong>Admissional e Periódico</strong></div></li>
                                <li><i className="fas fa-check"></i> <strong>Retorno ao Trabalho</strong></li>
                                <li><i className="fas fa-check"></i> <strong>Mudança de Função e Risco</strong></li>
                                <li><i className="fas fa-check"></i> <strong>Demissional</strong></li>
                                <li><i className="fas fa-microscope"></i> <div><strong>Exames Complementares (NRs)</strong><br /><small>Audiometria, Espirometria, ECG, Hemograma, etc.</small></div></li>
                            </ul>
                        </div>
                        <div className="service-card">
                            <h3>Estratégia & Prevenção</h3>
                            <ul className="service-list">
                                <li><i className="fas fa-shield-alt"></i> <div><strong>Consultoria PGR/PCMSO</strong></div></li>
                                <li><i className="fas fa-chalkboard-teacher"></i> <div><strong>Palestras e Treinamentos</strong></div></li>
                                <li><i className="fas fa-syringe"></i> <div><strong>Vacinação Corporativa</strong></div></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section id="instalacoes">
                <div className="container">
                    <div className="section-header">
                        <h2>Infraestrutura Premium</h2>
                        <div className="divider"></div>
                    </div>
                    <div className="facilities-grid">
                        {Array.isArray(facilities) && facilities.length > 0 ? facilities.map(item => (
                            <div key={item.id} className="facility-item" onClick={() => setLightboxImage(item)} title="Clique para ampliar">
                                <img src={item.image_url} alt={item.caption} />
                                <div className="facility-overlay"><h4>{item.caption}</h4></div>
                            </div>
                        )) : (
                            <p style={{textAlign:'center', gridColumn:'1/-1', color:'#718096'}}>Sincronizando instalações...</p>
                        )}
                    </div>
                </div>
            </section>

            {lightboxImage && (
                <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
                    <button className="lightbox-nav-btn lightbox-prev" onClick={handlePrevImage}><i className="fas fa-chevron-left"></i></button>
                    <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={() => setLightboxImage(null)}><i className="fas fa-times"></i></button>
                        <img src={lightboxImage.image_url} alt={lightboxImage.caption} />
                        <div className="lightbox-caption">{lightboxImage.caption}</div>
                    </div>
                    <button className="lightbox-nav-btn lightbox-next" onClick={handleNextImage}><i className="fas fa-chevron-right"></i></button>
                </div>
            )}

            <section id="blog" className="blog-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Blog & Insights</h2>
                        <div className="divider"></div>
                    </div>
                    
                    <div className="blog-grid">
                        {Array.isArray(blogPosts) && blogPosts.length > 0 ? blogPosts.map(post => (
                            <article key={post.id} className="blog-card" style={{cursor: 'pointer'}} onClick={() => navigate(`/blog/${post.id}`)}>
                                <div className="blog-img">
                                    <img src={post.image_url || 'https://via.placeholder.com/400x200?text=Sem+Imagem'} alt={post.title} />
                                </div>
                                <div className="blog-content">
                                    <span className="blog-date">{new Date(post.published_at).toLocaleDateString()}</span>
                                    <h3>{post.title}</h3>
                                    <span className="blog-link">Ler Artigo <i className="fas fa-arrow-right"></i></span>
                                </div>
                            </article>
                        )) : (
                            <p style={{gridColumn: '1/-1', textAlign: 'center', color: '#718096'}}>Sincronizando artigos...</p>
                        )}
                    </div>

                    <div style={{textAlign: 'center', marginTop: '40px'}}>
                        <button onClick={() => navigate('/blog')} className="btn btn-navy">Ver Todos os Artigos</button>
                    </div>
                </div>
            </section>

            <section id="localizacao" className="map-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Onde Estamos</h2>
                        <div className="divider"></div>
                    </div>
                    <div className="map-card">
                        <div className="map-container">
                            <iframe 
                                src={mapEmbedUrl} 
                                width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Mapa"
                            ></iframe>
                        </div>
                        <div className="map-info">
                            <h3>Visite-nos</h3>
                            <div className="contact-item">
                                <i className="fas fa-map-marker-alt"></i>
                                <p>{displayAddress}</p>
                            </div>
                            <div className="contact-item"><i className="fas fa-clock"></i><p>Segunda a Sexta<br />08:00 às 17:30</p></div>
                            <div className="contact-item"><i className="fas fa-phone"></i><p>{displayPhone}</p></div>
                            
                            <a href={mapGpsUrl} target="_blank" rel="noreferrer" className="btn btn-gold" style={{ marginTop: '10px', textAlign: 'center' }}>Abrir no GPS</a>
                        </div>
                    </div>
                </div>
            </section>

            <section id="contato" style={{ background: 'var(--white)', padding: '100px 0' }}>
                <div className="container">
                    <div className="contact-card-wrapper">
                        <div className="contact-form-side">
                            <h2 style={{ color: 'var(--white)', fontSize: '2.2rem', marginBottom: '10px' }}>Fale Conosco</h2>
                            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '40px' }}>Solicite orçamentos ou tire suas dúvidas.</p>
                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div style={{ gridColumn: 'span 1' }}>
                                        <label style={{ color: 'var(--accent-gold)', fontSize: '0.7rem' }}>Seu Nome</label>
                                        <input type="text" placeholder="Nome Completo" className="premium-input" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} required />
                                    </div>
                                    <div style={{ gridColumn: 'span 1' }}>
                                        <label style={{ color: 'var(--accent-gold)', fontSize: '0.7rem' }}>Seu E-mail</label>
                                        <input type="email" placeholder="contato@empresa.com" className="premium-input" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ color: 'var(--accent-gold)', fontSize: '0.7rem' }}>Mensagem</label>
                                        <textarea rows="3" placeholder="Sua mensagem..." className="premium-input" style={{ resize: 'none' }} value={formData.mensagem} onChange={(e) => setFormData({...formData, mensagem: e.target.value})} required></textarea>
                                    </div>
                                    <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                                        <button type="submit" id="submit-btn" className="btn btn-gold" style={{ width: '100%', padding: '18px' }}>Enviar Mensagem</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="contact-info-side">
                            <h3 style={{ color: 'var(--primary-navy)', fontSize: '1.8rem', marginBottom: '30px' }}>Conecte-se</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                {config.instagram_url && (
                                    <a href={config.instagram_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--primary-navy)', fontWeight: '600' }}>
                                        <i className="fab fa-instagram" style={{fontSize: '1.5rem', color: 'var(--primary-navy)'}}></i> @parrelamedicina
                                    </a>
                                )}
                                {config.linkedin_url && (
                                    <a href={config.linkedin_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--primary-navy)', fontWeight: '600' }}>
                                        <i className="fab fa-linkedin-in" style={{fontSize: '1.5rem', color: 'var(--primary-navy)'}}></i> LinkedIn Profissional
                                    </a>
                                )}
                                {config.whatsapp_url && (
                                    <a href={config.whatsapp_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--primary-navy)', fontWeight: '600' }}>
                                        <i className="fab fa-whatsapp" style={{fontSize: '1.5rem', color: 'var(--primary-navy)'}}></i> WhatsApp Comercial
                                    </a>
                                )}
                            </div>
                            <div style={{ marginTop: '60px', borderTop: '1px solid rgba(26, 32, 44, 0.1)', paddingTop: '25px' }}>
                                <p style={{ color: 'var(--primary-navy)', fontSize: '0.9rem', fontWeight: '500' }}><i className="fas fa-envelope"></i> contato@parrelamedicina.com.br</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer style={{ backgroundColor: 'var(--primary-navy)', color: '#718096', padding: '60px 0 30px', borderTop: '3px solid var(--accent-gold)' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <span className="logo" style={{ color: 'white', fontSize: '1.6rem', cursor: 'pointer' }} onClick={scrollToTop}>Dr. Rômulo <span>Parrela</span></span>
                    <div style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '25px' }}>
                        <p style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>© 2026 Parrela Medicina Ocupacional. <Link to="/login" className="admin-lock-btn"><i className="fas fa-lock"></i></Link></p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicHome;