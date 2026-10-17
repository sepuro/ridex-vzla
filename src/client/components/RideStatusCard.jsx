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
  AlertTriangle
} from 'lucide-react';
import { RIDE_STATUS } from '../../shared/constants.js';
import { formatUsd, formatBs } from '../utils/formatters.js';

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
    <div className="bg-[#111622]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-4 shadow-2xl space-y-4 animate-slide-up text-slate-100">
      {/* 1. MODO BÚSQUEDA DE CONDUCTOR */}
      {isSearching && (
        <div className="text-center py-4 space-y-3.5">
          <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
            <span className="absolute w-full h-full rounded-full bg-pixel-green/20 animate-ping" />
            <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-pixel-green flex items-center justify-center shadow-lg shadow-pixel-green/30">
              <span className="w-4 h-4 rounded-full bg-pixel-green animate-pulse" />
            </div>
          </div>

          <div>
            <h3 className="font-extrabold text-white text-base">Buscando conductores cercanos</h3>
            <p className="text-xs text-slate-400 mt-0.5">Enviando solicitud a conductores y mototaxis verificados...</p>
          </div>

          <div className="flex justify-between items-center py-2.5 px-3.5 rounded-2xl bg-black/40 border border-white/10 text-xs">
            <span className="text-slate-400 font-semibold">Tarifa garantizada:</span>
            <div className="text-right">
              <span className="font-black text-white mr-1.5 text-sm">{formatUsd(ride.fareUsd)}</span>
              <span className="font-bold text-pixel-greenLight">({formatBs(ride.fareBs)})</span>
            </div>
          </div>

          {!showCancelConfirm ? (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-xs transition active:scale-98 flex items-center justify-center space-x-1"
            >
              <X className="w-4 h-4 text-rose-500" />
              <span>Cancelar Solicitud</span>
            </button>
          ) : (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
              <p className="text-xs text-rose-300 font-bold">¿Seguro que deseas cancelar?</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="py-1.5 rounded-xl bg-white/10 text-white text-xs font-semibold"
                >
                  Seguir esperando
                </button>
                <button
                  onClick={() => onCancel(ride.id)}
                  className="py-1.5 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-md"
                >
                  Confirmar cancelación
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. CONDUCTOR ASIGNADO / EN CAMINO / EN VIAJE / FINALIZADO */}
      {!isSearching && (
        <>
          {/* Header de Estado con Progress Bar Dinámica */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  isPaid
                    ? 'bg-pixel-green shadow-md shadow-pixel-green/50'
                    : isCompleted
                    ? 'bg-pixel-yellow animate-pulse'
                    : 'bg-pixel-blueLight animate-ping'
                }`} />
                <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                  {isAccepted && 'Conductor en camino (3-5 min)'}
                  {isArrived && '¡Conductor en el sitio de recogida!'}
                  {isInProgress && 'Viaje en desarrollo hacia destino'}
                  {isCompleted && 'Viaje finalizado • Pago pendiente'}
                  {isPaid && 'Viaje liquidado y completado'}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 bg-black/40 px-2 py-0.5 rounded-full border border-white/5">
                #{ride.id}
              </span>
            </div>

            {/* Stepper visual de etapas del viaje */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[
                { label: 'Asignado', done: true },
                { label: 'En camino', done: isAccepted || isArrived || isInProgress || isCompleted || isPaid },
                { label: 'En viaje', done: isInProgress || isCompleted || isPaid },
                { label: 'Llegada', done: isCompleted || isPaid }
              ].map((step, idx) => (
                <div key={idx} className="space-y-1">
                  <div className={`h-1.5 rounded-full transition-all ${
                    step.done ? 'bg-pixel-green shadow-sm shadow-pixel-green/50' : 'bg-white/10'
                  }`} />
                  <span className={`block text-[9px] text-center font-bold truncate ${
                    step.done ? 'text-pixel-greenLight' : 'text-slate-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Información del Conductor y PIN de Seguridad */}
          {ride.driver && (
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1a2336] to-[#0f1725] border border-white/15 flex items-center justify-center text-pixel-greenLight font-black text-lg shadow-inner">
                    {ride.driver.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-extrabold text-white text-sm">{ride.driver.name}</h4>
                      <span className="text-[11px] text-pixel-yellow font-bold flex items-center">
                        ★ {ride.driver.rating || '4.95'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">
                      {ride.driver.model} ({ride.driver.color || 'Color original'})
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-[11px] font-mono font-black text-white">
                        {ride.driver.plate}
                      </span>
                      {/* PIN de seguridad estilo Uber */}
                      <span className="px-2 py-0.5 rounded-md bg-pixel-yellow/15 border border-pixel-yellow/30 text-[10px] font-mono font-black text-pixel-yellow">
                        PIN: {ridePin}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acciones de Contacto Rápido */}
                <div className="flex flex-col space-y-1.5">
                  <a
                    href={`tel:${ride.driver.phone}`}
                    className="w-9 h-9 rounded-full bg-pixel-green/15 border border-pixel-green/30 flex items-center justify-center text-pixel-green hover:bg-pixel-green/25 active:scale-95 transition"
                    title="Llamar al conductor"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://wa.me/58${String(ride.driver.phone || '').replace(/\D/g, '').replace(/^0/, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/25 active:scale-95 transition"
                    title="WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Ruta del viaje en tarjeta visual */}
          <div className="p-3 rounded-2xl bg-black/30 border border-white/5 space-y-2 text-xs">
            <div className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-pixel-green mt-1 flex-shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-slate-400 font-semibold block leading-none">RECOGIDA</span>
                <span className="text-slate-200 font-medium truncate block">{ride.pickup?.name || 'Origen fijado'}</span>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-pixel-yellow mt-1 flex-shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-slate-400 font-semibold block leading-none">DESTINO</span>
                <span className="text-slate-200 font-medium truncate block">{ride.dropoff?.name || 'Destino fijado'}</span>
              </div>
            </div>
          </div>

          {/* Botones de Seguridad y Compartir Viaje */}
          <div className="flex space-x-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center justify-center space-x-1.5 transition active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5 text-pixel-blueLight" />
              <span>Compartir con Familiar</span>
            </button>

            <a
              href="tel:911"
              className="py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-xs font-bold text-rose-400 flex items-center justify-center space-x-1 transition active:scale-95"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>VEN 911</span>
            </a>
          </div>

          {/* Tarifa y Botón de Pago */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Monto Total</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-lg font-black text-white">{formatUsd(ride.fareUsd)}</span>
                <span className="text-xs font-bold text-pixel-greenLight">{formatBs(ride.fareBs)}</span>
              </div>
            </div>

            {/* Acción de Pago */}
            {isPaid ? (
              <div className="flex items-center space-x-1.5 px-3 py-2 rounded-2xl bg-pixel-green/20 text-pixel-greenLight border border-pixel-green/30 text-xs font-black shadow-lg shadow-pixel-green/10">
                <CheckCircle className="w-4 h-4" />
                <span>Liquidado con Éxito</span>
              </div>
            ) : ride.payment ? (
              <div className="text-right">
                <span className="text-[11px] font-bold text-pixel-yellow block animate-pulse">
                  Verificando Pago...
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Ref: {ride.payment.reference || 'Efectivo recibido'}
                </span>
              </div>
            ) : (
              <button
                onClick={onOpenPayment}
                className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-pixel-green to-emerald-400 hover:brightness-105 text-black font-black text-xs shadow-xl shadow-pixel-green/30 flex items-center space-x-1.5 active:scale-95 transition"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pagar Viaje</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
