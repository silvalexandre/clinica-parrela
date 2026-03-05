import axios from 'axios';

// Verifica a URL no navegador em tempo real
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const api = axios.create({
    // Se for localhost, busca na porta 5000. Se for o site ao vivo, busca na rota /api do próprio domínio.
    baseURL: isLocalhost ? 'http://localhost:5000/api' : '/api',
});

// Interceptor para injetar o Token de login em todas as requisições
api.interceptors.request.use(async config => {
    const token = localStorage.getItem('@Auth:token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;