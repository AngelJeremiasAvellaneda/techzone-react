import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    email_notifications: true,
    order_updates: true,
    promotions: true,
    newsletter: true,
    push_notifications: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Cargar notificaciones
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (notificationsError) throw notificationsError;

      // Cargar configuraciones de notificaciones
      const { data: settingsData, error: settingsError } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        // PGRST116 es "No rows returned" - usar configuración por defecto
        throw settingsError;
      }

      setNotifications(notificationsData || []);
      
      if (settingsData) {
        setSettings(settingsData);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('No se pudieron cargar las notificaciones');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;
      
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));
      
      return { success: true };
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return { success: false, error: err.message };
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      return { success: true };
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return { success: false, error: err.message };
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      let result;
      
      // Verificar si ya existe una configuración
      const { data: existingSettings } = await supabase
        .from('notification_settings')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingSettings) {
        // Actualizar configuración existente
        const { error } = await supabase
          .from('notification_settings')
          .update(newSettings)
          .eq('id', existingSettings.id);

        if (error) throw error;
      } else {
        // Crear nueva configuración
        const { error } = await supabase
          .from('notification_settings')
          .insert({
            ...newSettings,
            user_id: userId
          });

        if (error) throw error;
      }

      setSettings(newSettings);
      return { success: true };
    } catch (err) {
      console.error('Error updating notification settings:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId, loadNotifications]);

  return {
    notifications,
    settings,
    loading,
    error,
    refetch: loadNotifications,
    markAsRead,
    markAllAsRead,
    updateSettings,
  };
};