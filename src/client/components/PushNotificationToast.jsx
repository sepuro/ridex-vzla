import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle,
  MapPin,
  Car,
  Bike,
  DollarSign,
  TrendingUp,
  X,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { subscribeInAppNotifications, requestNotificationPermissions, getNotificationPermissionStatus } from '../utils/notifications.js';

export function PushNotificationToast({ onNotificationClick }) {
  const [activeToast, setActiveToast] = useState(null);
  const [permissionPrompt, setPermissionPrompt] = useState(false);

  // Suscribirse a notificaciones entrantes
  useEffect(() => {
    const unsubscribe = subscribeInAppNotifications((notification) => {
      setActiveToast(notification);
    });

    // Comprobar si debemos sugerir activar notificaciones
    getNotificationPermissionStatus().then((status) => {
      if (status === 'prompt' || status === 'default') {
        const hasPrompted = sessionStorage.getItem('ridex_notif_prompted');
        if (!hasPrompted) {
          setPermissionPrompt(true);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Auto-dismiss del toast después de 6 segundos
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [activeToast]);

  const handleDismiss = (e) => {
    e?.stopPropagation();
    setActiveToast(null);
  };

  const handleEnablePermissions = async () => {
    sessionStorage.setItem('ridex_notif_prompted', 'true');
    setPermissionPrompt(false);
    await requestNotificationPermissions();
  };

  const handleDismissPrompt = () => {
    sessionStorage.setItem('ridex_notif_prompted', 'true');
    setPermissionPrompt(false);
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'ride_offer':
        return <Bell className="w-4 h-4 text-pixel-yellow animate-bounce" />;
      case 'ride_assigned':
        return <Car className="w-4 h-4 text-pixel-blueLight" />;
      case 'driver_arrived':
        return <MapPin className="w-4 h-4 text-pixel-green" />;
      case 'ride_completed':
        return <CheckCircle className="w-4 h-4 text-pixel-greenLight" />;
      case 'wallet':
        return <DollarSign className="w-4 h-4 text-pixel-green" />;
      case 'bcv_update':
        return <TrendingUp className="w-4 h-4 text-amber-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div className="fixed top-2 left-0 right-0 z-50 pointer-events-none px-3 sm:px-4 max-w-md mx-auto space-y-2">
      {/* 1. Banner de Solicitud de Permisos Push */}
      {permissionPrompt && !activeToast && (
        <div className="pointer-events-auto p-3 rounded-2xl bg-[#111622]/95 backdrop-blur-xl border border-pixel-green/40 shadow-2xl animate-slide-down flex items-center justify-between space-x-2 text-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-pixel-green/20 border border-pixel-green/30 flex items-center justify-center text-pixel-green">
              <Bell className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-black text-white leading-tight">Activa Notificaciones Push</p>
              <p className="text-[10px] text-slate-400 leading-tight">Recibe alertas en vivo de choferes y pagos</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={handleEnablePermissions}
              className="px-2.5 py-1 rounded-xl bg-pixel-green text-black font-black text-[11px] shadow-sm active:scale-95 transition"
            >
              Activar
            </button>
            <button
              onClick={handleDismissPrompt}
              className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Push Notification Toast estilo Dynamic Island / Pixel Pill */}
      {activeToast && (
        <div
          onClick={() => {
            if (onNotificationClick) onNotificationClick(activeToast);
            setActiveToast(null);
          }}
          className="pointer-events-auto p-3.5 rounded-2xl bg-[#0d121c]/95 backdrop-blur-2xl border border-white/20 shadow-[0_10px_35px_rgba(0,0,0,0.7)] animate-slide-down flex items-start justify-between space-x-3 text-slate-100 cursor-pointer active:scale-98 transition"
        >
          <div className="flex items-start space-x-2.5 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-inner mt-0.5">
              {getIconForType(activeToast.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-white truncate pr-2">{activeToast.title}</h4>
                <span className="text-[9px] font-mono text-slate-400 flex-shrink-0">Ahora</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium leading-snug line-clamp-2 mt-0.5">
                {activeToast.body}
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
