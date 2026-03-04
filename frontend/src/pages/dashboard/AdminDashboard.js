import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/AdminPanel.css';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);

    // Definição dos Botões e Permissões
    const menuItems = [
        { 
            title: 'Usuários', 
            icon: 'fa-users', 
            link: '/admin/users', 
            roles: ['super_usuario'] 
        },
        { 
            title: 'Nossas Instalações', 
            icon: 'fa-building', 
            link: '/admin/facilities', 
            roles: ['super_usuario', 'admin'] 
        },
        { 
            title: 'Configurações do Site', 
            icon: 'fa-cogs', 
            link: '/admin/config', 
            roles: ['super_usuario', 'admin'] 
        },
        { 
            title: 'Blog', 
            icon: 'fa-newspaper', 
            link: '/admin/blog', 
            roles: ['super_usuario', 'admin'] 
        },
        { 
            title: 'Mensagens', 
            icon: 'fa-envelope', 
            link: '/admin/messages', 
            roles: ['super_usuario', 'admin', 'operacional'] 
        },
        { 
            title: 'E-mails (Outlook/Webmail)', 
            icon: 'fa-at', 
            link: '/admin/emails', 
            roles: ['super_usuario', 'admin', 'operacional'] 
        }
    ];

    // Filtrar menu baseado no cargo do usuário logado
    const allowedItems = menuItems.filter(item => item.roles.includes(user.role));

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    <h2>Olá, {user.name || 'Usuário'}</h2>
                    <p>Perfil: <span style={{fontWeight:'bold'}}>{user.role.toUpperCase().replace('_', ' ')}</span></p>
                </div>
                <button onClick={logout} className="btn-navy">
                    <i className="fas fa-sign-out-alt"></i> Sair
                </button>
            </div>

            <div className="admin-grid-menu">
                {allowedItems.map((item, index) => (
                    <Link to={item.link} key={index} className="admin-card">
                        <i className={`fas ${item.icon}`}></i>
                        <h3>{item.title}</h3>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;