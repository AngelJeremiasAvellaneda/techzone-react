// src/hooks/useOrderExpiration.js (CORREGIDO)
import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const useOrderExpiration = () => {
  const expirationTimers = useRef({});
  const expiredOrders = useRef(new Set());
  const navigate = useNavigate();

  const calculateTimeLeft = useCallback((expiresAt) => {
    if (!expiresAt) return 0;
    const expiresTime = new Date(expiresAt).getTime();
    const now = new Date().getTime();
    return Math.max(0, Math.floor((expiresTime - now) / 1000));
  }, []);

  const startExpirationTimer = useCallback((orderId, expiresAt, onExpire) => {
    if (!orderId) return null;
    
    if (expiredOrders.current.has(orderId) || expirationTimers.current[orderId]) {
      return null;
    }

    const timeLeft = calculateTimeLeft(expiresAt);
    
    if (timeLeft <= 0) {
      // Si ya expiró, ejecutar inmediatamente
      onExpire?.();
      return null;
    }

    const timerId = setTimeout(() => {
      try {
        if (!expiredOrders.current.has(orderId)) {
          expiredOrders.current.add(orderId);
          onExpire?.();
        }
      } catch (error) {
        console.error('Error in expiration timer:', error);
      } finally {
        delete expirationTimers.current[orderId];
      }
    }, timeLeft * 1000);

    expirationTimers.current[orderId] = timerId;
    return timerId;
  }, [calculateTimeLeft]);

  const stopExpirationTimer = useCallback((orderId) => {
    if (orderId && expirationTimers.current[orderId]) {
      clearTimeout(expirationTimers.current[orderId]);
      delete expirationTimers.current[orderId];
    }
  }, []);

  const clearOrderState = useCallback((orderId) => {
    if (!orderId) return;
    
    // Limpiar localStorage
    localStorage.removeItem(`pending_order_${orderId}`);
    localStorage.removeItem('last_order_id');
    localStorage.removeItem('last_payment_method');
    
    // Limpiar sessionStorage
    sessionStorage.removeItem(`order_${orderId}_timer`);
    
    // Detener temporizador
    stopExpirationTimer(orderId);
    
    // Marcar como expirado
    expiredOrders.current.add(orderId);
  }, [stopExpirationTimer]);

  const redirectToCartWithCleanup = useCallback((orderId, message) => {
    if (!orderId) return;
    
    clearOrderState(orderId);
    
    // Mostrar toast de expiración
    if (message) {
      toast.error(message);
    }
    
    navigate('/carrito', { 
      replace: true, 
      state: { 
        expiredOrder: true, 
        orderId, 
        message: message || 'El pedido ha expirado' 
      } 
    });
  }, [navigate, clearOrderState]);

  return {
    calculateTimeLeft,
    startExpirationTimer,
    stopExpirationTimer,
    clearOrderState,
    redirectToCartWithCleanup,
    expiredOrders: expiredOrders.current
  };
};