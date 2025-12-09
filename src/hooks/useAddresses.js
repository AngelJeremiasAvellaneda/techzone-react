import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useAddresses = (userId) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAddresses = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (err) {
      console.error('Error loading addresses:', err);
      setError('No se pudieron cargar las direcciones');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addAddress = async (addressData) => {
    try {
      // Si se marca como default, primero quitar el default de otras direcciones
      if (addressData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const { data, error } = await supabase
        .from('addresses')
        .insert({
          ...addressData,
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;
      
      await loadAddresses();
      return { success: true, data };
    } catch (err) {
      console.error('Error adding address:', err);
      return { success: false, error: err.message };
    }
  };

  const updateAddress = async (addressId, updates) => {
    try {
      // Si se marca como default, primero quitar el default de otras direcciones
      if (updates.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const { error } = await supabase
        .from('addresses')
        .update(updates)
        .eq('id', addressId)
        .eq('user_id', userId);

      if (error) throw error;
      
      setAddresses(prev => prev.map(addr => 
        addr.id === addressId ? { ...addr, ...updates } : addr
      ));
      
      return { success: true };
    } catch (err) {
      console.error('Error updating address:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', userId);

      if (error) throw error;
      
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      return { success: true };
    } catch (err) {
      console.error('Error deleting address:', err);
      return { success: false, error: err.message };
    }
  };

  const setDefaultAddress = async (addressId) => {
    try {
      // Primero, quitar el default de todas las direcciones
      const { error: clearError } = await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);

      if (clearError) throw clearError;

      // Luego, establecer la nueva dirección como default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .eq('user_id', userId);

      if (error) throw error;
      
      await loadAddresses();
      return { success: true };
    } catch (err) {
      console.error('Error setting default address:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    if (userId) {
      loadAddresses();
    }
  }, [userId, loadAddresses]);

  return {
    addresses,
    loading,
    error,
    refetch: loadAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };
};