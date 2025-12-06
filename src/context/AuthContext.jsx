import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("🔥 AuthContext: Estado actual", { 
    loading, 
    user: user?.email, 
    profile: profile?.role 
  });

  // Función para cargar perfil
  const fetchProfile = async (userId) => {
    if (!userId) {
      setProfile(null);
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.log("⚠️ Perfil no encontrado, creando uno básico...");
        // Crear perfil básico
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert([{
            id: userId,
            full_name: null,
            avatar_url: null,
            role: "customer"
          }])
          .select()
          .single();

        if (insertError) {
          console.error("❌ Error creando perfil:", insertError);
          const fallback = { id: userId, role: "customer" };
          setProfile(fallback);
          return fallback;
        }

        setProfile(newProfile);
        return newProfile;
      }

      console.log("✅ Perfil cargado:", data.role);
      setProfile(data);
      return data;
    } catch (err) {
      console.error("❌ Error al cargar perfil:", err);
      const fallback = { id: userId, role: "customer" };
      setProfile(fallback);
      return fallback;
    }
  };

  // Inicialización
  useEffect(() => {
    console.log("🔄 Auth: Iniciando...");
    
    let mounted = true;

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        
        console.log("🔐 Sesión obtenida:", session?.user?.email || "null");
        const currentUser = session?.user || null;
        setUser(currentUser);

        if (currentUser) {
          return fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }
      })
      .catch((error) => {
        console.error("❌ Error al obtener sesión:", error);
      })
      .finally(() => {
        if (mounted) {
          console.log("✅ Auth: Inicialización COMPLETADA");
          setLoading(false);
        }
      });

    // Escuchar cambios
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("🔄 Cambio de auth:", event);
        if (!mounted) return;
        
        const newUser = session?.user || null;
        setUser(newUser);

        if (newUser) {
          fetchProfile(newUser.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      console.log("🧹 Auth: Limpiando...");
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // 🔴 MÉTODOS QUE TU Login.jsx NECESITA:
  const signIn = async ({ email, password }) => {
    try {
      setError(null);
      console.log("🔐 Iniciando sesión para:", email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log("✅ Sesión iniciada:", data.user.email);
      setUser(data.user);
      await fetchProfile(data.user.id);
      
      return { success: true, data };
    } catch (err) {
      console.error("❌ Error al iniciar sesión:", err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const signUp = async ({ email, password, fullName }) => {
    try {
      setError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) throw error;

      return {
        success: true,
        message: "Revisa tu correo para confirmar tu cuenta.",
        data,
      };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const signInWithProvider = async (provider) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setProfile(null);
      console.log("✅ Sesión cerrada");
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user?.id) throw new Error("No autenticado");

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return { success: true, profile: data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Helper functions
  const getRole = () => profile?.role || "customer";
  const isAdminOrStaff = () => {
    const role = getRole();
    return role === "admin" || role === "staff";
  };
  const isAdmin = () => getRole() === "admin";
  const isStaff = () => getRole() === "staff";
  const isCustomer = () => getRole() === "customer";
  const isAuthenticated = !!user;
  const getUserRole = getRole;

  const value = {
    // Estado
    user,
    profile,
    loading,
    error,
    
    // Métodos de autenticación (LO QUE TU Login.jsx NECESITA)
    signIn,
    signUp,
    signOut,
    signInWithProvider, // 🔴 IMPORTANTE: Login.jsx lo usa
    updateProfile,
    resetPassword,
    
    // Helpers
    getRole,
    isAdminOrStaff,
    isAdmin,
    isStaff,
    isCustomer,
    isAuthenticated,
    getUserRole,
    
    // Otros métodos
    refreshProfile: () => user ? fetchProfile(user.id) : null,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};