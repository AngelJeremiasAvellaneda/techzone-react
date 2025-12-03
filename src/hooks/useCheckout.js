// src/hooks/useCheckout.js
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para crear una orden
  const createOrder = async (orderData) => {
    setLoading(true);
    setError(null);

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: orderData.userId,
            total: orderData.total,
            status: 'pending',
            shipping_address: orderData.shippingAddress,
            billing_address: orderData.billingAddress,
            payment_method: orderData.paymentMethod,
            shipping_cost: orderData.shippingCost,
            tax_amount: orderData.taxAmount,
            subtotal: orderData.subtotal,
            discount_amount: orderData.discountAmount,
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      return { success: true, order };
    } catch (error) {
      console.error('Error creating order:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para crear items de orden
  const createOrderItems = async (orderId, items) => {
    try {
      const orderItems = items.map(item => ({
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        product_name: item.name,
        product_image: item.image
      }));

      const { error } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error creating order items:', error);
      throw error;
    }
  };

  // Función para guardar dirección
  const saveAddress = async (userId, addressData, isDefault = false) => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .insert([
          {
            user_id: userId,
            full_name: addressData.full_name,
            phone: addressData.phone,
            email: addressData.email,
            address: addressData.address,
            city: addressData.city,
            country: addressData.country,
            zip_code: addressData.zip_code,
            is_default: isDefault,
            address_type: addressData.address_type || 'shipping'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      return { success: true, address: data };
    } catch (error) {
      console.error('Error saving address:', error);
      return { success: false, error: error.message };
    }
  };

  // Función para procesar pago completo
  const processCheckout = async (checkoutData) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Guardar dirección si es nueva
      let addressId = checkoutData.addressId;
      
      if (!addressId && checkoutData.saveAddress && checkoutData.userId) {
        const addressResult = await saveAddress(
          checkoutData.userId, 
          checkoutData.shippingAddress,
          true
        );
        
        if (addressResult.success) {
          addressId = addressResult.address.id;
        }
      }

      // 2. Crear la orden
      const orderData = {
        userId: checkoutData.userId,
        total: checkoutData.total,
        subtotal: checkoutData.subtotal,
        shippingCost: checkoutData.shippingCost,
        taxAmount: checkoutData.taxAmount,
        discountAmount: checkoutData.discountAmount,
        shippingAddress: checkoutData.shippingAddress,
        billingAddress: checkoutData.billingAddress || checkoutData.shippingAddress,
        paymentMethod: checkoutData.paymentMethod,
      };

      const orderResult = await createOrder(orderData);
      
      if (!orderResult.success) {
        throw new Error(orderResult.error);
      }

      // 3. Crear items de la orden
      await createOrderItems(orderResult.order.id, checkoutData.items);

      // 4. Aquí integrarías con el gateway de pago (MercadoPago, Culqi, etc.)
      // Por ahora simulamos el éxito
      await new Promise(resolve => setTimeout(resolve, 1500));

      return { 
        success: true, 
        order: orderResult.order,
        orderId: orderResult.order.id 
      };

    } catch (error) {
      console.error('Error processing checkout:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener órdenes del usuario
  const getUserOrders = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              name,
              image
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, orders: data };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { success: false, error: error.message };
    }
  };

  // Función para obtener una orden específica
  const getOrderById = async (orderId) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              name,
              image
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      return { success: true, order: data };
    } catch (error) {
      console.error('Error fetching order:', error);
      return { success: false, error: error.message };
    }
  };

  // Función para actualizar estado de la orden
  const updateOrderStatus = async (orderId, status) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    loading,
    error,
    processCheckout,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    saveAddress,
    createOrder
  };
}