import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RutaProtegidaAdmin = ({ children }) => {
  const { user, esAdmin, loading } = useAuth();

  if (loading) return <div className="text-white p-8">Cargando permisos...</div>;

  // Si no está logueado va al Login
  if (!user) return <Navigate to="/login" replace />;

  // Si no es Admin, lo redirigimos a la página principal
  if (!esAdmin) return <Navigate to="/" replace />;

  return children;
};

export default RutaProtegidaAdmin;