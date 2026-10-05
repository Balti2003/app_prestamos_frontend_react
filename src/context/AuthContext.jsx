import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/me/');
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
          console.error("Error al obtener sesión:", err);
          logout();
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Roles, permisos y contexto de empresa
  const esAdmin = user?.es_admin === true || user?.empresa?.rol === 'admin';
  const empresa = user?.empresa || null;
  const nombreEmpresa = user?.empresa?.nombre || 'Mi Negocio';

  // Helper universal para verificar permisos en cualquier componente
  const tienePermiso = (nombrePermiso) => {
    if (esAdmin) return true;
    return user?.permisos?.[nombrePermiso] === true;
  };

  return (
    <AuthContext.Provider value={{
      user,
      empresa,
      nombreEmpresa,
      esAdmin,
      tienePermiso,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);