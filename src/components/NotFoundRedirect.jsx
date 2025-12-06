// NotFoundRedirect.jsx - Corregir
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFoundRedirect = () => {
  const navigate = useNavigate();
  const { user, isAdminOrStaff } = useAuth(); // Usar isAdminOrStaff del contexto

  useEffect(() => {
    // Redirigir según el rol del usuario
    if (user && isAdminOrStaff && isAdminOrStaff()) {
      navigate('/admin', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [user, isAdminOrStaff, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  );
};

export default NotFoundRedirect;