// src/hooks/useAuth.js
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Obtener sesión actual
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  // Función para verificar si el usuario es admin
  const isAdmin = () => {
    return profile?.role === 'admin';
  };

  // Función para verificar si el usuario es staff
  const isStaff = () => {
    return profile?.role === 'admin' || profile?.role === 'staff';
  };

  // Función para verificar si el usuario es cliente
  const isCustomer = () => {
    return profile?.role === 'customer' || !profile?.role;
  };

  // Función para obtener el rol del usuario
  const getUserRole = () => {
    return profile?.role || 'customer';
  };

  const signUp = async ({ email, password, fullName }) => {
    try {
      setError(null);
      
      // 1. Crear usuario en Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      // 2. Crear perfil en la tabla profiles
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              full_name: fullName,
              role: 'customer',
            }
          ]);

        if (profileError) throw profileError;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error signing up:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const signIn = async ({ email, password }) => {
    try {
      setError(null);
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      return { success: true, data };
    } catch (error) {
      console.error('Error signing in:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (updates) => {
    try {
      setError(null);
      
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      await loadProfile(user.id);
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email) => {
    try {
      setError(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Función para obtener todos los usuarios (solo para admins)
  const getAllUsers = async () => {
    try {
      if (!isAdmin()) {
        throw new Error('No tienes permisos para ver usuarios');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, users: data };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { success: false, error: error.message };
    }
  };

  // Función para actualizar el rol de un usuario (solo para admins)
  const updateUserRole = async (userId, newRole) => {
    try {
      if (!isAdmin()) {
        throw new Error('No tienes permisos para cambiar roles');
      }

      // Validar que el rol sea válido
      const validRoles = ['admin', 'staff', 'customer'];
      if (!validRoles.includes(newRole)) {
        throw new Error('Rol inválido');
      }

      // No permitir que un admin se quite su propio rol de admin
      if (userId === user?.id && newRole !== 'admin') {
        throw new Error('No puedes cambiar tu propio rol de administrador');
      }

      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      // Si el usuario actualizó su propio perfil, recargarlo
      if (userId === user?.id) {
        await loadProfile(userId);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating user role:', error);
      return { success: false, error: error.message };
    }
  };

  // Función para obtener estadísticas de usuarios (solo para admins)
  const getUserStats = async () => {
    try {
      if (!isAdmin()) {
        throw new Error('No tienes permisos para ver estadísticas');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .not('role', 'is', null);

      if (error) throw error;

      const stats = {
        total: data.length,
        admins: data.filter(u => u.role === 'admin').length,
        staff: data.filter(u => u.role === 'staff').length,
        customers: data.filter(u => u.role === 'customer').length,
      };

      return { success: true, stats };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return { success: false, error: error.message };
    }
  };

  // Función para buscar usuarios (solo para admin/staff)
  const searchUsers = async (query) => {
    try {
      if (!isAdmin() && !isStaff()) {
        throw new Error('No tienes permisos para buscar usuarios');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return { success: true, users: data };
    } catch (error) {
      console.error('Error searching users:', error);
      return { success: false, error: error.message };
    }
  };

  // Función para obtener detalles de un usuario específico (solo para admin/staff)
  const getUserById = async (userId) => {
    try {
      if (!isAdmin() && !isStaff()) {
        throw new Error('No tienes permisos para ver detalles de usuario');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          orders:orders(count)
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { success: true, user: data };
    } catch (error) {
      console.error('Error fetching user by id:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    // Estado
    user,
    profile,
    loading,
    error,
    
    // Funciones de autenticación
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    
    // Verificación de autenticación
    isAuthenticated: !!user,
    
    // Funciones de roles
    isAdmin,
    isStaff,
    isCustomer,
    getUserRole,
    
    // Funciones de administración (solo para admin/staff)
    getAllUsers,
    updateUserRole,
    getUserStats,
    searchUsers,
    getUserById
  };
}