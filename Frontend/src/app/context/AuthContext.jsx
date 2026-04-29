import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import API_URL from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [authError, setAuthError] = useState(null);

  const login = useCallback(async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthError(data.error || 'Error al iniciar sesión');
        return false;
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      setAuthError(null);
      return true;
    } catch (error) {
      setAuthError('Error de conexión con el servidor');
      return false;
    }
  }, []);

  const register = useCallback(async (username, email, password, extraData = {}) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, ...extraData }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthError(data.error || 'Error al registrarse');
        return false;
      }

      // Login automático tras registro
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      setAuthError(null);
      return true;
    } catch (error) {
      setAuthError('Error de conexión con el servidor');
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }, []);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
    
    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401 || response.status === 403) {
      logout();
      return null;
    }
    
    return response;
  }, [token, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        authError,
        login,
        register,
        logout,
        fetchWithAuth,
        clearError: () => setAuthError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  return ctx;
}
