import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export const usePaymentMethods = (userId) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPaymentMethods = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (err) {
      console.error('Error loading payment methods:', err);
      setError('No se pudieron cargar los métodos de pago');
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addPaymentMethod = async (paymentData) => {
    try {
      // Si se marca como default, primero quitar el default de otros
      if (paymentData.is_default) {
        await supabase
          .from('payment_methods')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          ...paymentData,
          user_id: userId,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      
      await loadPaymentMethods();
      return { success: true, data };
    } catch (err) {
      console.error('Error adding payment method:', err);
      return { success: false, error: err.message };
    }
  };

  const deletePaymentMethod = async (paymentMethodId) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active: false })
        .eq('id', paymentMethodId)
        .eq('user_id', userId);

      if (error) throw error;
      
      await loadPaymentMethods();
      return { success: true };
    } catch (err) {
      console.error('Error deleting payment method:', err);
      return { success: false, error: err.message };
    }
  };

  const setDefaultPaymentMethod = async (paymentMethodId) => {
    try {
      // Primero, quitar el default de todos
      const { error: clearError } = await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', userId);

      if (clearError) throw clearError;

      // Luego, establecer el nuevo como default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', paymentMethodId)
        .eq('user_id', userId);

      if (error) throw error;
      
      await loadPaymentMethods();
      return { success: true };
    } catch (err) {
      console.error('Error setting default payment method:', err);
      return { success: false, error: err.message };
    }
  };

  const maskCardNumber = (cardNumber) => {
    if (!cardNumber) return '';
    const last4 = cardNumber.slice(-4);
    return `**** **** **** ${last4}`;
  };

  const validateCard = (cardData) => {
    const errors = {};
    
    if (!cardData.card_number || cardData.card_number.replace(/\s/g, '').length < 16) {
      errors.card_number = 'Número de tarjeta inválido';
    }
    
    if (!cardData.exp_month || cardData.exp_month < 1 || cardData.exp_month > 12) {
      errors.exp_month = 'Mes inválido';
    }
    
    const currentYear = new Date().getFullYear();
    if (!cardData.exp_year || cardData.exp_year < currentYear) {
      errors.exp_year = 'Año expirado';
    }
    
    if (!cardData.cvv || cardData.cvv.length < 3) {
      errors.cvv = 'CVV inválido';
    }
    
    return errors;
  };

  useEffect(() => {
    if (userId) {
      loadPaymentMethods();
    }
  }, [userId, loadPaymentMethods]);

  return {
    paymentMethods,
    loading,
    error,
    refetch: loadPaymentMethods,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    maskCardNumber,
    validateCard,
  };
};