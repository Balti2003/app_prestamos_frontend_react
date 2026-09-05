import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

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
          // eslint-disable-next-line react-hooks/immutability
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

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Roles y permisos
  const esAdmin = user?.es_admin === true;

  // ⚡ Helper universal para verificar permisos en cualquier componente
  const tienePermiso = (nombrePermiso) => {
    if (esAdmin) return true; // El administrador siempre tiene todos los permisos
    return user?.permisos?.[nombrePermiso] === true;
  };

  return (
    <AuthContext.Provider value={{ user, esAdmin, tienePermiso, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);