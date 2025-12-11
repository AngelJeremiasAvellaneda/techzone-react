// src/hooks/useCleanupExpiredOrders.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export const useCleanupExpiredOrders = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const cleanupLocalStorage = () => {
      // Limpiar pedidos pendientes del localStorage
      const pendingOrders = Object.keys(localStorage)
        .filter(key => key.startsWith('pending_order_'))
        .map(key => key.replace('pending_order_', ''));

      if (pendingOrders.length > 0) {
        const checkOrders = async () => {
          for (const orderId of pendingOrders) {
            try {
              const { data: order, error } = await supabase
                .from('orders')
                .select('status, expires_at')
                .eq('id', orderId)
                .single();

              if (!error && order) {
                // Si el pedido ya no está pendiente, limpiar del localStorage
                if (order.status !== 'pending') {
                  localStorage.removeItem(`pending_order_${orderId}`);
                  localStorage.removeItem('last_order_id');
                }
              }
            } catch (error) {
              console.error('Error checking order:', error);
            }
          }
        };

        checkOrders();
      }
    };

    // Ejecutar al cargar la app
    cleanupLocalStorage();

    // También limpiar sessionStorage de temporizadores viejos
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('order_') && key.endsWith('_timer')) {
        sessionStorage.removeItem(key);
      }
    });
  }, [navigate]);
};