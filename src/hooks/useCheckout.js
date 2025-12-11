// src/hooks/useCheckout.js (CORREGIDO)
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';

export const useCheckout = () => {
  const [loading, setLoading] = useState(false);
  const ORDER_EXPIRATION_MINUTES = 1; // 24 horas para producción

  const processCheckout = async (checkoutData) => {
    setLoading(true);

    try {
      // Calcular fecha de expiración
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + ORDER_EXPIRATION_MINUTES);

      // Preparar items con toda la información necesaria
      const orderItems = checkoutData.items.map(item => ({
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || item.images?.[0] || '/placeholder-product.jpg',
        specifications: item.specifications || {},
        category: item.category,
        brand: item.brand
      }));

      const orderData = {
        user_id: checkoutData.userId,
        total: checkoutData.total,
        subtotal: checkoutData.subtotal,
        shipping_cost: checkoutData.shippingCost,
        tax_amount: checkoutData.taxAmount,
        discount_amount: checkoutData.discountAmount,
        coupon_code: checkoutData.couponCode,
        shipping_address: checkoutData.shippingAddress,
        billing_address: checkoutData.billingAddress,
        payment_method: checkoutData.paymentMethod,
        payment_status: 'pending',
        status: 'pending',
        expires_at: expiresAt.toISOString(),
        items: orderItems
      };

      console.log('Creando pedido con datos:', orderData);

      // Crear pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();
      
      if (orderError) {
        console.error('Error al crear pedido:', orderError);
        throw orderError;
      }

      console.log('Pedido creado:', order);

      // Actualizar stock de productos
      for (const item of checkoutData.items) {
        const { data: product, error: prodError } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.id)
          .single();
        
        if (prodError) {
          console.error('Error al obtener producto:', prodError);
          throw prodError;
        }

        const newStock = product.stock - item.quantity;

        const { error: updateError } = await supabase
          .from('products')
          .update({ 
            stock: newStock, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', item.id);
        
        if (updateError) {
          console.error('Error al actualizar stock:', updateError);
          throw updateError;
        }
      }

      // Guardar referencia local
      localStorage.setItem(`pending_order_${order.id}`, 'true');
      localStorage.setItem('last_order_id', order.id);
      localStorage.setItem('last_payment_method', checkoutData.paymentMethod);

      setLoading(false);
      return {
        success: true,
        orderId: order.id,
        orderNumber: `ORD-${String(order.id).padStart(6, '0')}`,
        expiresAt: expiresAt.toISOString()
      };

    } catch (error) {
      console.error('Error processing checkout:', error);
      toast.error('Error al procesar el pedido: ' + error.message);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const verifyPaymentStatus = async (orderId) => {
    try {
      console.log('Verificando estado del pedido:', orderId);
      
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (error) {
        console.error('Error al verificar pago:', error);
        throw error;
      }

      console.log('Estado del pedido obtenido:', order);

      return { 
        success: true, 
        status: order.payment_status, 
        orderStatus: order.status, 
        expiresAt: order.expires_at 
      };
    } catch (error) {
      console.error('Error verifying payment:', error);
      return { success: false, error: error.message };
    }
  };

  const getOrderById = async (orderId) => {
    try {
      console.log('Obteniendo pedido:', orderId);
      
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (error) {
        console.error('Error al obtener pedido:', error);
        throw error;
      }

      console.log('Pedido obtenido de la base de datos:', order);

      // Parsear items si es string JSON
      if (order.items && typeof order.items === 'string') {
        try {
          order.items = JSON.parse(order.items);
          console.log('Items parseados:', order.items);
        } catch (e) {
          console.error('Error al parsear items:', e);
          order.items = [];
        }
      } else if (!order.items) {
        order.items = [];
      }

      return { success: true, order };
    } catch (error) {
      console.error('Error getting order:', error);
      return { success: false, error: error.message };
    }
  };

  const cancelOrder = async (orderId, reason = 'Cancelado por el usuario') => {
    try {
      console.log('Cancelando pedido:', orderId, 'Razón:', reason);

      // Verificar si el pedido existe y está pendiente
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (fetchError) {
        console.error('Error al obtener pedido para cancelar:', fetchError);
        throw fetchError;
      }

      console.log('Estado actual del pedido:', order.status);

      // Solo cancelar si está pendiente
      if (order.status === 'pending') {
        const { error } = await supabase
          .from('orders')
          .update({
            status: 'cancelled',
            payment_status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            cancellation_reason: reason,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);
        
        if (error) {
          console.error('Error al actualizar estado del pedido:', error);
          throw error;
        }

        // Restaurar stock
        await restoreOrderStock(orderId);

        // Eliminar del localStorage
        localStorage.removeItem(`pending_order_${orderId}`);

        console.log('Pedido cancelado exitosamente');
        return { success: true };
      } else {
        console.log('El pedido no se puede cancelar porque ya no está pendiente');
        return { 
          success: false, 
          error: 'El pedido no se puede cancelar porque ya no está pendiente' 
        };
      }

    } catch (error) {
      console.error('Error cancelling order:', error);
      return { success: false, error: error.message };
    }
  };

  const restoreOrderStock = async (orderId) => {
    try {
      console.log('Restaurando stock para pedido:', orderId);
      
      const { data: order, error } = await supabase
        .from('orders')
        .select('items')
        .eq('id', orderId)
        .single();
      
      if (error) {
        console.error('Error al obtener pedido para restaurar stock:', error);
        throw error;
      }

      if (!order.items || order.items.length === 0) {
        console.log('No hay items para restaurar');
        return;
      }

      // Parsear items si es necesario
      let items = order.items;
      if (typeof items === 'string') {
        try {
          items = JSON.parse(items);
        } catch (e) {
          console.error('Error al parsear items:', e);
          return;
        }
      }

      console.log('Items a restaurar:', items);

      for (const item of items) {
        if (!item.product_id || !item.quantity) continue;
        
        try {
          const { data: product, error: prodError } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single();
          
          if (prodError) {
            console.error(`Error obteniendo producto ${item.product_id}:`, prodError);
            continue;
          }

          const newStock = (product.stock || 0) + (item.quantity || 0);

          console.log(`Restaurando stock: Producto ${item.product_id}, Stock actual: ${product.stock}, Cantidad: ${item.quantity}, Nuevo stock: ${newStock}`);

          const { error: updateError } = await supabase
            .from('products')
            .update({ 
              stock: newStock, 
              updated_at: new Date().toISOString() 
            })
            .eq('id', item.product_id);
          
          if (updateError) {
            console.error(`Error actualizando producto ${item.product_id}:`, updateError);
          }
        } catch (itemError) {
          console.error(`Error procesando item ${item.product_id}:`, itemError);
        }
      }

      console.log('Stock restaurado exitosamente');
    } catch (error) {
      console.error('Error restoring stock:', error);
    }
  };

  return { 
    processCheckout, 
    verifyPaymentStatus, 
    getOrderById, 
    cancelOrder, 
    loading 
  };
};