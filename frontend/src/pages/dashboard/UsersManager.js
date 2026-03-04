import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext'; // Para saber quem sou eu (evitar auto-exclusão visual)
import { Link } from 'react-router-dom';
import '../../styles/AdminPanel.css';
import Swal from 'sweetalert2';

const UsersManager = () => {
    const { user: currentUser } = useContext(AuthContext); // Usuário logado atualmente
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ full_name: '', email: '', password: '', role: 'operacional' });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await api.get('/users'); 
            setUsers(response.data);
        } catch (error) {
            console.error("Erro ao carregar usuários", error);
            Swal.fire('Erro', 'Não foi possível carregar a lista de usuários.', 'error');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        
        // Validação simples
        if (newUser.password.length < 6) {
            Swal.fire('Senha Fraca', 'A senha deve ter pelo menos 6 caracteres.', 'warning');
            return;
        }

        try {
            await api.post('/auth/register', newUser); 
            
            Swal.fire({
                title: 'Sucesso!',
                text: 'Novo usuário cadastrado.',
                icon: 'success',
                confirmButtonColor: '#1a202c'
            });

            setNewUser({ full_name: '', email: '', password: '', role: 'operacional' });
            loadUsers(); // Recarrega a lista
        } catch (error) {
            Swal.fire('Erro', 'Não foi possível criar o usuário. Verifique se o e-mail já existe.', 'error');
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Tem certeza?',
            text: "Essa ação removerá o acesso deste usuário permanentemente.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e53e3e',
            cancelButtonColor: '#2d3748',
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/users/${id}`);
                    setUsers(users.filter(u => u.id !== id));
                    Swal.fire('Excluído!', 'O usuário foi removido.', 'success');
                } catch (error) {
                    // Se o backend retornar erro (ex: tentar apagar a si mesmo)
                    Swal.fire('Erro', error.response?.data?.error || 'Erro ao excluir.', 'error');
                }
            }
        });
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>Gerenciar Usuários</h2>
                <Link to="/admin" className="btn-navy">Voltar ao Menu</Link>
            </div>

            {/* CARD DE CADASTRO */}
            <div className="admin-card" style={{ height: 'auto', alignItems: 'flex-start', marginBottom: '30px' }}>
                <h3>Cadastrar Novo Membro</h3>
                <p style={{color: '#718096', fontSize: '0.9rem', marginBottom: '15px'}}>
                    Crie contas para sua equipe. "Operacional" apenas lê mensagens. "Admin" edita o site.
                </p>
                
                <form onSubmit={handleCreate} style={{ width: '100%', display: 'grid', gap: '15px' }}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                        <input type="text" placeholder="Nome Completo" className="login-input" 
                            value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} required />
                        <input type="email" placeholder="E-mail de Acesso" className="login-input" 
                            value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required />
                    </div>
                    
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                        <input type="password" placeholder="Senha (min. 6 caracteres)" className="login-input" 
                            value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required />
                        
                        <select className="login-input" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                            <option value="operacional">Operacional (Visualizar)</option>
                            <option value="admin">Administrador (Editar Site)</option>
                            <option value="super_usuario">Super Usuário (Total)</option>
                        </select>
                    </div>
                    
                    <button type="submit" className="btn-gold" style={{width: '200px'}}>Cadastrar</button>
                </form>
            </div>

            {/* TABELA DE USUÁRIOS */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h3>Equipe Cadastrada</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', color: 'var(--primary-navy)' }}>
                            <th style={{ padding: '10px' }}>Nome</th>
                            <th>Email</th>
                            <th>Nível</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '15px 10px' }}>
                                    {u.full_name} 
                                    {u.id === currentUser.id && <span style={{marginLeft: '5px', fontSize:'0.7rem', color: '#718096'}}>(Você)</span>}
                                </td>
                                <td>{u.email}</td>
                                <td>
                                    <span className="status-pill" style={{ 
                                        background: u.role === 'super_usuario' ? '#c5a47e' : (u.role === 'admin' ? '#2c5282' : '#718096'),
                                        fontSize: '0.75rem'
                                    }}>
                                        {u.role.toUpperCase().replace('_', ' ')}
                                    </span>
                                </td>
                                <td>
                                    {/* Só mostra botão de excluir se NÃO for o próprio usuário */}
                                    {u.id !== currentUser.id && (
                                        <button 
                                            className="btn-navy" 
                                            title="Remover Usuário"
                                            onClick={() => handleDelete(u.id)}
                                            style={{ 
                                                padding: '5px 10px', 
                                                fontSize: '0.8rem', 
                                                background: '#e53e3e',
                                                minWidth: 'auto'
                                            }}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && <p style={{padding: '20px', textAlign: 'center', color: '#718096'}}>Carregando...</p>}
            </div>
        </div>
    );
};

export default UsersManager;