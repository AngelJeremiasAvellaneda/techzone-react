// src/components/OrderRouteGuard.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useOrderExpiration } from '../hooks/useOrderExpiration';
import { useAuth } from '../context/AuthContext';

const OrderRouteGuard = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { isOrderInvalid, redirectToCartWithCleanup } = useOrderExpiration();
  const { user } = useAuth();

  useEffect(() => {
    const protectOrderRoutes = async () => {
      // Solo proteger rutas relacionadas con pedidos
      const orderRoutes = [
        '/checkout/checkout-success',
        '/payment/process/',
        '/order/'
      ];

      const isOrderRoute = orderRoutes.some(route => 
        location.pathname.includes(route)
      );

      if (!isOrderRoute) return;

      // Extraer orderId de la URL o del state
      let orderId;
      
      if (params.orderId) {
        orderId = params.orderId;
      } else if (location.state?.orderId) {
        orderId = location.state.orderId;
      } else if (location.pathname.includes('/checkout/checkout-success')) {
        // Intentar obtener del localStorage
        orderId = localStorage.getItem('last_order_id');
      }

      if (!orderId) {
        navigate('/cart', { replace: true });
        return;
      }

      // Verificar si el pedido es válido
      const isInvalid = await isOrderInvalid(orderId);
      
      if (isInvalid) {
        redirectToCartWithCleanup(orderId, 'Este pedido ya no está disponible');
        return;
      }

      // Verificar propiedad del pedido (si está logueado)
      if (user) {
        try {
          const { data: order, error } = await supabase
            .from('orders')
            .select('user_id')
            .eq('id', orderId)
            .single();

          if (!error && order.user_id !== user.id) {
            redirectToCartWithCleanup(orderId, 'No tienes permiso para ver este pedido');
            return;
          }
        } catch (error) {
          console.error('Error verifying order ownership:', error);
        }
      }
    };

    protectOrderRoutes();
  }, [location, params, user, navigate, isOrderInvalid, redirectToCartWithCleanup]);

  return children;
};

export default OrderRouteGuard;