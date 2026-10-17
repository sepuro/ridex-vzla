/**
 * RideX Venezuela - Sistema de Notificaciones Push
 * Compatible con Capacitor Android Nativo (LocalNotifications) y navegadores web/PWA.
 */

import { LocalNotifications } from '@capacitor/local-notifications';
import { triggerHaptic, playNotificationChime, playArrivalChime, playAcceptChime } from './soundEffects.js';

// Lista de suscriptores para notificaciones flotantes in-app
const inAppSubscribers = new Set();
let notificationHistory = [];

/**
 * Suscribirse a notificaciones in-app
 * @param {(notification: object) => void} callback
 * @returns {() => void} unsubscribe
 */
export function subscribeInAppNotifications(callback) {
  inAppSubscribers.add(callback);
  return () => inAppSubscribers.delete(callback);
}

/**
 * Verificar estado de permisos de notificación
 * @returns {Promise<'granted' | 'denied' | 'prompt'>}
 */
export async function getNotificationPermissionStatus() {
  try {
    if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
      const res = await LocalNotifications.checkPermissions();
      return res.display === 'granted' ? 'granted' : res.display === 'denied' ? 'denied' : 'prompt';
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
  } catch (err) {
    console.warn('[Push] Error comprobando permisos:', err);
  }
  return 'prompt';
}

/**
 * Solicitar permiso para enviar notificaciones push
 * @returns {Promise<boolean>}
 */
export async function requestNotificationPermissions() {
  try {
    // 1. Android Nativo con Capacitor
    if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
      const result = await LocalNotifications.requestPermissions();
      const granted = result.display === 'granted';
      if (granted) {
        triggerHaptic(60);
      }
      return granted;
    }

    // 2. Web API / PWA en Chrome / Firefox / Safari
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      const granted = perm === 'granted';
      if (granted) {
        triggerHaptic(60);
      }
      return granted;
    }
  } catch (err) {
    console.warn('[Push] Error solicitando permisos:', err);
  }
  return false;
}

/**
 * Despachar una Notificación Push (Nativa, Web e In-App)
 * @param {object} options
 * @param {string} options.title - Título de la notificación
 * @param {string} options.body - Contenido del mensaje
 * @param {string} [options.type] - 'ride_offer' | 'ride_assigned' | 'driver_arrived' | 'ride_completed' | 'bcv_update' | 'wallet'
 * @param {object} [options.data] - Metadatos opcionales
 * @param {boolean} [options.sound=true] - Reproducir sonido
 */
export async function sendPushNotification({
  title,
  body,
  type = 'info',
  data = null,
  sound = true
}) {
  const notifId = Math.floor(Date.now() % 1000000);
  const notificationItem = {
    id: notifId,
    title,
    body,
    type,
    data,
    createdAt: new Date().toISOString(),
    read: false
  };

  // 1. Guardar en historial en memoria
  notificationHistory = [notificationItem, ...notificationHistory.slice(0, 49)];

  // 2. Notificar a observadores in-app (Toast flotante tipo Dynamic Island)
  inAppSubscribers.forEach((callback) => {
    try {
      callback(notificationItem);
    } catch (err) {
      console.error('[Push] Error en suscriptor in-app:', err);
    }
  });

  // 3. Reproducir sonido y vibración según el tipo
  if (sound) {
    if (type === 'ride_offer') {
      playNotificationChime();
    } else if (type === 'driver_arrived') {
      playArrivalChime();
    } else if (type === 'ride_completed' || type === 'ride_assigned' || type === 'wallet') {
      playAcceptChime();
    } else {
      triggerHaptic(80);
    }
  }

  // 4. Despachar a nivel de Sistema Operativo (Android Nativo / Web Notification)
  try {
    // Si estamos en Android Nativo (Capacitor)
    if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: notifId,
            schedule: { at: new Date(Date.now() + 100) },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: data
          }
        ]
      });
      return;
    }

    // Si estamos en navegador Web con permisos otorgados
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      new Notification(title, {
        body,
        icon: '/icon.png',
        badge: '/icon.png',
        data
      });
    }
  } catch (err) {
    console.warn('[Push] Error despachando notificación nativa/web:', err);
  }
}

/**
 * Obtener historial de notificaciones
 */
export function getNotificationHistory() {
  return [...notificationHistory];
}

/**
 * Limpiar historial de notificaciones
 */
export function clearNotificationHistory() {
  notificationHistory = [];
}
