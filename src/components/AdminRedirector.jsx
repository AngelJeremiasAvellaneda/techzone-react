import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRedirector() {
  const { user, isAdminOrStaff, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user && isAdminOrStaff()) {
      // Si es admin/staff y NO está en una ruta admin
      const isAdminRoute = location.pathname.startsWith('/admin');
      const isAuthRoute = ['/login', '/register'].includes(location.pathname);
      
      if (!isAdminRoute && !isAuthRoute) {
        console.log("🔐 Redirección forzada: Admin debe estar en /admin");
        navigate('/admin', { replace: true });
      }
    }
  }, [user, loading, isAdminOrStaff, location.pathname, navigate]);

  return null; // Este componente no renderiza nada
}