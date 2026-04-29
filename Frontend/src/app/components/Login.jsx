import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { login, register, authError, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Limpia el error al cambiar de modo (login / registro)
  useEffect(() => {
    clearError();
  }, [isRegister, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let success = false;
    if (isRegister) {
      success = await register(username, email, password);
    } else {
      success = await login(username, password);
    }

    if (success) {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-4 rounded-full shadow-lg">
            {isRegister
              ? <UserPlus className="w-8 h-8 text-white" />
              : <LogIn className="w-8 h-8 text-white" />
            }
          </div>
        </div>

        <h1 className="text-center text-3xl mb-1">Sistema de Stock</h1>
        <p className="text-center text-gray-500 mb-6">
          {isRegister ? 'Crear nueva cuenta' : 'Iniciar sesión en tu cuenta'}
        </p>

        {/* Error message */}
        {authError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Hint for demo */}
        {!isRegister && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-4 text-xs text-blue-600">
            <span className="font-medium">Demo:</span> usuario{' '}
            <code className="bg-blue-100 px-1 rounded">admin</code> / contraseña{' '}
            <code className="bg-blue-100 px-1 rounded">admin123</code>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                placeholder="correo@ejemplo.com"
                required={isRegister}
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-700 mb-1">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              placeholder="nombre de usuario"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Procesando…'
              : isRegister
              ? 'Registrarse'
              : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-600 hover:text-blue-700 text-sm transition-colors"
          >
            {isRegister
              ? '¿Ya tienes cuenta? Inicia sesión'
              : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
}
