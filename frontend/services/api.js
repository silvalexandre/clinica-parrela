import axios from 'axios';

const api = axios.create({
    // Se estiver na Vercel, usa a rota /api. Se estiver no seu PC, usa o localhost.
    baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api',
});

// Interceptor para injetar o Token em todas as requisições
api.interceptors.request.use(async config => {
    const token = localStorage.getItem('@Auth:token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;