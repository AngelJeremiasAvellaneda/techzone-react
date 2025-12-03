// src/hooks/useOrders.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useOrders(userId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              id,
              name,
              image,
              category:categories (name)
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('No se pudieron cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  const getOrderStatusInfo = (status) => {
    const statusMap = {
      pending: { label: 'Pendiente', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
      paid: { label: 'Pagado', color: 'bg-blue-500', textColor: 'text-blue-600' },
      processing: { label: 'Procesando', color: 'bg-purple-500', textColor: 'text-purple-600' },
      shipped: { label: 'Enviado', color: 'bg-indigo-500', textColor: 'text-indigo-600' },
      delivered: { label: 'Entregado', color: 'bg-green-500', textColor: 'text-green-600' },
      cancelled: { label: 'Cancelado', color: 'bg-red-500', textColor: 'text-red-600' },
    };

    return statusMap[status] || { label: status, color: 'bg-gray-500', textColor: 'text-gray-600' };
  };

  const getPaymentMethodInfo = (method) => {
    const methodMap = {
      tarjeta: { label: 'Tarjeta', icon: '💳' },
      yape: { label: 'Yape', icon: '📱' },
      efectivo: { label: 'Contra entrega', icon: '💰' },
      paypal: { label: 'PayPal', icon: '🌐' },
    };

    return methodMap[method] || { label: method, icon: '💳' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTotalItems = (order) => {
    return order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    getOrderStatusInfo,
    getPaymentMethodInfo,
    formatDate,
    getTotalItems
  };
}