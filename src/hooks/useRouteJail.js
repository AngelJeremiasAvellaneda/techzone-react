import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function useRouteJail() {
  const { user, isAdminOrStaff, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user) {
      const isAdminRoute = location.pathname.startsWith('/admin');
      
      if (isAdminOrStaff() && !isAdminRoute) {
        // Admin en ruta pública -> redirigir a /admin
        console.log("🔐 Route Jail: Admin en ruta pública, redirigiendo a /admin");
        navigate('/admin', { replace: true });
      } else if (!isAdminOrStaff() && isAdminRoute) {
        // No-admin en ruta admin -> redirigir a /
        console.log("🚫 Route Jail: No-admin en área admin, redirigiendo a /");
        navigate('/', { replace: true });
      }
    }
  }, [user, loading, isAdminOrStaff, location.pathname, navigate]);
}