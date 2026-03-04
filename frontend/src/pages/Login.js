import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminPanel.css';

const Login = () => {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/admin');
        } catch (error) {
            alert('Falha no login. Verifique suas credenciais.');
        }
    };

    return (
        <div style={{ 
            height: '100vh', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            background: 'var(--primary-navy)' 
        }}>
            <form onSubmit={handleLogin} style={{ 
                background: 'white', 
                padding: '40px', 
                borderRadius: '8px', 
                width: '100%', 
                maxWidth: '400px' 
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Área Restrita</h2>
                <div style={{ marginBottom: '15px' }}>
                    <label>Email</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc' }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label>Senha</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc' }}
                    />
                </div>
                <button type="submit" className="btn btn-gold" style={{ width: '100%' }}>Entrar</button>
            </form>
        </div>
    );
};

export default Login;