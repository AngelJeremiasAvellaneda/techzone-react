import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  const now = new Date().toISOString();

  const { data: expiredOrders, error: fetchError } = await supabase
    .from('orders')
    .select('id, items')
    .eq('status', 'pending')
    .lt('expires_at', now);

  if (fetchError) return res.status(500).json({ error: fetchError.message });

  if (!expiredOrders || expiredOrders.length === 0) {
    return res.status(200).json({ message: 'No hay pedidos expirados' });
  }

  for (const order of expiredOrders) {
    await supabase.from('orders').update({
      status: 'cancelled',
      payment_status: 'expired',
      cancelled_at: now,
      cancellation_reason: 'Tiempo expirado',
      updated_at: now
    }).eq('id', order.id);

    if (order.items && Array.isArray(order.items)) {
      for (const item of order.items) {
        if (item.product_id) {
          const { data: product } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single();

          const newStock = (product.stock || 0) + (item.quantity || 0);

          await supabase
            .from('products')
            .update({ stock: newStock, updated_at: now })
            .eq('id', item.product_id);
        }
      }
    }
  }

  res.status(200).json({ message: 'Pedidos expirados procesados', count: expiredOrders.length });
}
