import React, { useState } from 'react';
import {
  Phone,
  MessageSquare,
  ShieldCheck,
  MapPin,
  AlertCircle,
  CheckCircle,
  CreditCard,
  X,
  Share2,
  Lock,
  Clock,
  Compass,
  Car,
  Bike,
  AlertTriangle,
  Sparkles,
  Shield,
  Package
} from 'lucide-react';
import { RIDE_STATUS } from '../../shared/constants.js';
import { formatUsd, formatBs } from '../utils/formatters.js';
import { triggerHaptic } from '../utils/soundEffects.js';

export function RideStatusCard({
  ride,
  onCancel,
  onOpenPayment
}) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSafetySheet, setShowSafetySheet] = useState(false);

  if (!ride) return null;

  const isSearching = ride.status === RIDE_STATUS.SEARCHING;
  const isAccepted = ride.status === RIDE_STATUS.ACCEPTED;
  const isArrived = ride.status === RIDE_STATUS.ARRIVED;
  const isInProgress = ride.status === RIDE_STATUS.IN_PROGRESS;
  const isCompleted = ride.status === RIDE_STATUS.COMPLETED;
  const isPaid = ride.status === RIDE_STATUS.PAID;

  // Código PIN de seguridad único de 4 dígitos basado en el ID del viaje
  const ridePin = (ride.id ? String(ride.id.replace(/\D/g, '')).slice(-4) : '4829') || '4829';

  // Enlace para compartir viaje por WhatsApp en tiempo real
  const handleShareWhatsApp = () => {
    triggerHaptic(40);
    const text = encodeURIComponent(
      `🛡️ *RideX Venezuela - Monitoreo de Viaje en Vivo*\n\n` +
      `👤 *Conductor:* ${ride.driver?.name || 'Asignado'}\n` +
      `🚗 *Vehículo:* ${ride.driver?.model || 'Vehículo'} (${ride.driver?.color || 'Color estándar'})\n` +
      `🔢 *Placa:* ${ride.driver?.plate || 'AB123CD'}\n` +
      `🔒 *PIN de verificación:* ${ridePin}\n\n` +
      `📍 *Origen:* ${ride.pickup?.name || 'Origen fijado'}\n` +
      `🏁 *Destino:* ${ride.dropoff?.name || 'Destino fijado'}\n` +
      `💵 *Tarifa:* ${formatUsd(ride.fareUsd)} (${formatBs(ride.fareBs)})\n\n` +
      `_Monitoreado vía GPS por RideX Venezuela._`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="bg-[#0D111A]/95 backdrop-blur-2xl border border-white/[0.12] rounded-3xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.6)] space-y-4 animate-slide-up text-slate-100 relative overflow-hidden select-none">
      {/* 1. MODO BÚSQUEDA DE CONDUCTOR */}
      {isSearching && (
        <div className="text-center py-4 space-y-4">
          {/* Radar Animado Multi-Anillo */}
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
            <span className="absolute w-full h-full rounded-full bg-[#00E599]/20 animate-radar" />
            <span className="absolute w-3/4 h-3/4 rounded-full bg-[#00D2FF]/25 animate-radar-multi" />
            <div className="w-14 h-14 rounded-full bg-[#06080D] border-2 border-[#00E599] flex items-center justify-center shadow-[0_0_25px_rgba(0,229,153,0.4)] relative z-10">
              <span className="w-4 h-4 rounded-full bg-[#00E599] animate-pulse" />
            </div>
          </div>

          <div>
            <h3 className="font-black text-white text-base">Buscando conductores cercanos</h3>
            <p className="text-xs text-slate-400 mt-0.5">Contactando con conductores y mototaxis verificados...</p>
          </div>

          <div className="flex justify-between items-center py-2.5 px-3.5 rounded-2xl bg-black/40 border border-white/[0.08] text-xs">
            <span className="text-slate-400 font-semibold">Tarifa fija garantizada:</span>
            <div className="text-right">
              <span className="font-black text-white mr-1.5 text-sm">{formatUsd(ride.fareUsd)}</span>
              <span className="font-black text-[#00E599]">({formatBs(ride.fareBs)})</span>
            </div>
          </div>

          {!showCancelConfirm ? (
            <button
              onClick={() => {
                triggerHaptic(30);
                setShowCancelConfirm(true);
              }}
              className="w-full py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 font-bold text-xs tap-scale transition-colors duration-140 flex items-center justify-center space-x-1"
            >
              <X className="w-4 h-4 text-[#FF3B5C]" />
              <span>Cancelar Solicitud</span>
            </button>
          ) : (
            <div className="p-3 rounded-2xl bg-[#FF3B5C]/10 border border-[#FF3B5C]/30 space-y-2 animate-fade-in">
              <p className="text-xs text-[#FF7088] font-bold">¿Seguro que deseas cancelar la carrera?</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="py-1.5 rounded-xl bg-white/10 text-white text-xs font-semibold tap-scale transition-colors duration-140"
                >
                  Seguir esperando
                </button>
                <button
                  onClick={() => {
                    triggerHaptic(50);
                    onCancel(ride.id);
                  }}
                  className="py-1.5 rounded-xl bg-[#FF3B5C] text-white text-xs font-black shadow-md tap-scale transition-transform duration-140"
                >
                  Sí, Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. MODO CONDUCTOR ASIGNADO, EN CAMINO, LLEGÓ O EN VIAJE */}
      {(isAccepted || isArrived || isInProgress || isCompleted || isPaid) && (
        <div className="space-y-4">
          {/* Banner de Estado del Viaje o Delivery */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E599] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00E599]"></span>
              </span>
              <div>
                <h3 className="font-black text-white text-sm">
                  {ride.serviceMode === 'delivery' ? (
                    isAccepted ? 'Repartidor asignado — en camino' :
                    isArrived ? '¡El repartidor ha llegado al punto!' :
                    isInProgress ? 'Encomienda en tránsito hacia destino' :
                    isCompleted ? '¡Encomienda entregada en destino!' :
                    'Entrega completada y liquidada'
                  ) : (
                    isAccepted ? 'Conductor asignado — en camino' :
                    isArrived ? '¡El conductor ha llegado al punto!' :
                    isInProgress ? 'Viaje en curso hacia tu destino' :
                    isCompleted ? '¡Has llegado a tu destino!' :
                    'Viaje finalizado y liquidado'
                  )}
                </h3>
                <span className="text-[11px] text-slate-400">
                  {isAccepted && 'Llegada estimada en 4-6 minutos'}
                  {isArrived && (ride.serviceMode === 'delivery' ? 'Esperando entrega de paquete' : 'Te espera en la dirección indicada')}
                  {isInProgress && 'Monitoreo satelital activo'}
                  {isCompleted && 'Listo para procesar el pago'}
                  {isPaid && (ride.serviceMode === 'delivery' ? '¡Gracias por usar RideX Envíos!' : '¡Gracias por viajar con RideX!')}
                </span>
              </div>
            </div>

            {/* PIN de Seguridad del Viaje o Entrega */}
            <div className="text-right">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">
                {ride.serviceMode === 'delivery' ? 'PIN Entrega' : 'PIN Seguridad'}
              </span>
              <span className="font-mono font-black text-base text-[#00E599] tracking-wider bg-[#00E599]/10 px-2 py-0.5 rounded-lg border border-[#00E599]/30">
                {ride.packageDetails?.deliveryPin || ridePin}
              </span>
            </div>
          </div>

          {/* Tarjeta de Destinatario si es Delivery */}
          {ride.serviceMode === 'delivery' && ride.packageDetails && (
            <div className="p-3 rounded-2xl bg-[#00D2FF]/10 border border-[#00D2FF]/25 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#00D2FF]/20 text-[#00D2FF] flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Destinatario</span>
                  <span className="font-bold text-white block truncate">{ride.packageDetails.receiverName || 'Receptor'}</span>
                  {ride.packageDetails.receiverPhone && (
                    <span className="text-[10px] text-slate-300 font-mono block">{ride.packageDetails.receiverPhone}</span>
                  )}
                </div>
              </div>
              {ride.packageDetails.notes && (
                <div className="text-right max-w-[120px]">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Notas</span>
                  <span className="text-[10px] text-slate-300 truncate block">{ride.packageDetails.notes}</span>
                </div>
              )}
            </div>
          )}

          {/* Tarjeta del Conductor y Vehículo */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00E599] to-[#00D2FF] p-0.5 shadow-md">
                <div className="w-full h-full bg-[#06080D] rounded-[14px] flex items-center justify-center text-white font-black text-base">
                  {ride.driver?.name?.charAt(0) || 'C'}
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-white text-sm">{ride.driver?.name || 'Carlos Mendoza'}</span>
                  <ShieldCheck className="w-4 h-4 text-[#00E599]" />
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  {ride.driver?.model || 'Bera SBR 150'} • <span className="text-slate-400">{ride.driver?.color || 'Rojo'}</span>
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Placa: {ride.driver?.plate || 'AB123CD'}
                  </span>
                  <span className="text-[11px] text-[#FFB800] font-bold">
                    ★ {ride.driver?.rating || '4.98'}
                  </span>
                </div>
              </div>
            </div>

            {/* Botones de Comunicación Rápida */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShareWhatsApp}
                className="w-9 h-9 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 flex items-center justify-center tap-scale transition-colors duration-140"
                title="Compartir ruta en WhatsApp"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <a
                href={`tel:${ride.driver?.phone || '04121234567'}`}
                className="w-9 h-9 rounded-xl bg-[#00D2FF]/20 hover:bg-[#00D2FF]/30 border border-[#00D2FF]/30 text-[#00D2FF] flex items-center justify-center tap-scale transition-colors duration-140"
                title="Llamar al conductor"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Botón de Pago si está Completado */}
          {isCompleted && (
            <button
              onClick={() => {
                triggerHaptic(50);
                onOpenPayment();
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00E599] via-[#00F5A0] to-[#00D2FF] text-black font-black text-sm tracking-[-0.01em] shadow-xl shadow-[#00E599]/30 tap-scale shimmer-button transition-transform duration-140 flex items-center justify-center space-x-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>PAGAR VIAJE • {formatUsd(ride.fareUsd)} ({formatBs(ride.fareBs)})</span>
            </button>
          )}

          {/* Botón de Cancelar si aún está en fase inicial */}
          {(isAccepted || isArrived) && !showCancelConfirm && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="w-full py-2 text-center text-xs text-slate-400 hover:text-[#FF7088] transition-colors duration-140 font-semibold tap-scale"
            >
              ¿Deseas cancelar este viaje?
            </button>
          )}

          {showCancelConfirm && (
            <div className="p-3 rounded-2xl bg-[#FF3B5C]/10 border border-[#FF3B5C]/30 space-y-2 animate-fade-in">
              <p className="text-xs text-[#FF7088] font-bold">¿Cancelar carrera con conductor en camino?</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="py-1.5 rounded-xl bg-white/10 text-white text-xs font-semibold tap-scale transition-colors duration-140"
                >
                  Continuar viaje
                </button>
                <button
                  onClick={() => {
                    triggerHaptic(50);
                    onCancel(ride.id);
                  }}
                  className="py-1.5 rounded-xl bg-[#FF3B5C] text-white text-xs font-black tap-scale transition-transform duration-140"
                >
                  Confirmar Cancelación
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
