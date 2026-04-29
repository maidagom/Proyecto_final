import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Usuarios } from './components/Usuarios';
import { Categorias } from './components/Categorias';
import { Productos } from './components/Productos';
import { Stock } from './components/Stock';

function PrivateRoute({ children, roles = [] }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles.length > 0 && !roles.includes(user.rol)) return <Navigate to="/dashboard" />;
  
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="productos" element={<Productos />} />
            <Route path="stock" element={<Stock />} />
            
            {/* Rutas exclusivas ADMIN */}
            <Route path="usuarios" element={
              <PrivateRoute roles={['ADMIN']}>
                <Usuarios />
              </PrivateRoute>
            } />
            <Route path="categorias" element={
              <PrivateRoute roles={['ADMIN']}>
                <Categorias />
              </PrivateRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
