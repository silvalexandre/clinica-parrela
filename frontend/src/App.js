import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import BlogEditor from './pages/dashboard/BlogEditor';

// Páginas Públicas
import PublicHome from './pages/PublicHome';
import PublicBlog from './pages/blog/PublicBlog'; // Nova página
import SinglePost from './pages/blog/SinglePost'; // Nova página
import Login from './pages/Login';

// Área Administrativa
import AdminDashboard from './pages/dashboard/AdminDashboard';
import UsersManager from './pages/dashboard/UsersManager';
import FacilitiesManager from './pages/dashboard/FacilitiesManager';
import SiteConfig from './pages/dashboard/SiteConfig';
import BlogManager from './pages/dashboard/BlogManager';
import MessagesAdmin from './pages/dashboard/MessagesAdmin';
import EmailsViewer from './pages/dashboard/EmailsViewer';

// Proteção de Rotas
const PrivateRoute = ({ children, requiredRole }) => {
    const { user, signed, loading } = useContext(AuthContext);

    if (loading) return <div>Carregando...</div>;
    if (!signed) return <Navigate to="/login" />;

    if (requiredRole && user.role !== requiredRole && user.role !== 'super_usuario') {
         return <Navigate to="/admin" />;
    }

    return children;
};

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* ROTAS PÚBLICAS */}
                    <Route path="/" element={<PublicHome />} />
                    <Route path="/blog" element={<PublicBlog />} />
                    <Route path="/blog/:id" element={<SinglePost />} />
                    <Route path="/login" element={<Login />} />
                    

                    {/* ROTAS PRIVADAS (ADMIN) */}
                    <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
                    <Route path="/admin/users" element={<PrivateRoute requiredRole="super_usuario"><UsersManager /></PrivateRoute>} />
                    <Route path="/admin/facilities" element={<PrivateRoute requiredRole="admin"><FacilitiesManager /></PrivateRoute>} />
                    <Route path="/admin/config" element={<PrivateRoute requiredRole="admin"><SiteConfig /></PrivateRoute>} />
                    <Route path="/admin/blog" element={<PrivateRoute requiredRole="admin"><BlogManager /></PrivateRoute>} />
                    <Route path="/admin/blog/novo" element={<PrivateRoute requiredRole="admin"><BlogEditor /></PrivateRoute>} />
                    <Route path="/admin/blog/editar/:id" element={<PrivateRoute requiredRole="admin"><BlogEditor /></PrivateRoute>} />
                    <Route path="/admin/messages" element={<PrivateRoute><MessagesAdmin /></PrivateRoute>} />
                    <Route path="/admin/emails" element={<PrivateRoute><EmailsViewer /></PrivateRoute>} />

                    <Route path="/admin/*" element={<Navigate to="/admin" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;