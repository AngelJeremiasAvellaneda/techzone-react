import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useSecurity = () => {
  const [loading, setLoading] = useState(false);

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);

      // Verificar la contraseña actual
      const { data: userData, error: signInError } = await supabase.auth.getUser();
      
      if (signInError) {
        throw new Error('No se pudo verificar la sesión actual');
      }

      // Cambiar la contraseña
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return { success: true, message: 'Contraseña actualizada correctamente' };
    } catch (err) {
      console.error('Error changing password:', err);
      
      // Mensajes de error específicos
      let errorMessage = err.message;
      if (err.message.includes('Invalid login credentials')) {
        errorMessage = 'La contraseña actual es incorrecta';
      } else if (err.message.includes('Password should be at least')) {
        errorMessage = 'La nueva contraseña debe tener al menos 6 caracteres';
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 6) {
      errors.push('Debe tener al menos 6 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Debe contener al menos una mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Debe contener al menos una minúscula');
    }
    if (!/\d/.test(password)) {
      errors.push('Debe contener al menos un número');
    }
    
    return errors;
  };

  return {
    changePassword,
    validatePassword,
    loading,
  };
};