import axios from 'axios';

// A "Mágica" do Deploy: 
// Se o site estiver rodando no seu computador (localhost), ele usa a porta 5000.
// Se estiver rodando na internet, ele usa a URL oficial do seu backend na Vercel.
const api = axios.create({
    baseURL: window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api' 
        : 'https://SEU-PROJETO-BACKEND.vercel.app/api' // <-- ATENÇÃO: Trocaremos isso pela URL real depois!
});

// O Interceptador: Pega o crachá no bolso (localStorage) e mostra na porta (Header)
api.interceptors.request.use(config => {
    const token = window.localStorage.getItem('token');
    
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;