import React from 'react';
import { Phone, MessageSquare, ShieldCheck, MapPin, AlertCircle, CheckCircle, CreditCard, X } from 'lucide-react';
import { RIDE_STATUS } from '../../shared/constants.js';
import { formatUsd, formatBs } from '../utils/formatters.js';

export function RideStatusCard({
  ride,
  onCancel,
  onOpenPayment
}) {
  if (!ride) return null;

  const isSearching = ride.status === RIDE_STATUS.SEARCHING;
  const isAccepted = ride.status === RIDE_STATUS.ACCEPTED;
  const isArrived = ride.status === RIDE_STATUS.ARRIVED;
  const isInProgress = ride.status === RIDE_STATUS.IN_PROGRESS;
  const isCompleted = ride.status === RIDE_STATUS.COMPLETED;
  const isPaid = ride.status === RIDE_STATUS.PAID;

  return (
    <div className="bg-cardBg border border-borderCol rounded-3xl p-4 shadow-2xl space-y-4 animate-slide-up">
      {/* 1. Modo Búsqueda de Conductor */}
      {isSearching && (
        <div className="text-center py-4 space-y-3">
          <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
            <span className="absolute w-full h-full rounded-full bg-accentGreen/20 animate-ping" />
            <div className="w-12 h-12 rounded-full bg-surfaceBg border-2 border-accentGreen flex items-center justify-center">
              <span className="w-4 h-4 rounded-full bg-accentGreen animate-pulse" />
            </div>
          </div>

          <div>
            <h3 className="font-extrabold text-white text-base">Buscando conductores cercanos</h3>
            <p className="text-xs text-slate-400 mt-0.5">Enviando solicitud a mototaxis y taxis en la zona...</p>
          </div>

          <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-surfaceBg border border-borderCol text-xs">
            <span className="text-slate-400">Tarifa cotizada:</span>
            <div className="text-right">
              <span className="font-bold text-white mr-1.5">{formatUsd(ride.fareUsd)}</span>
              <span className="font-semibold text-accentGreen">({formatBs(ride.fareBs)})</span>
            </div>
          </div>

          <button
            onClick={() => onCancel(ride.id)}
            className="w-full py-2.5 rounded-xl bg-surfaceBg hover:bg-surfaceBg/80 border border-borderCol text-slate-300 font-bold text-xs transition active:scale-98 flex items-center justify-center space-x-1"
          >
            <X className="w-4 h-4 text-dangerRed" />
            <span>Cancelar Solicitud</span>
          </button>
        </div>
      )}

      {/* 2. Conductor Asignado / En Curso / Finalizado */}
      {!isSearching && (
        <>
          {/* Status Badge */}
          <div className="flex items-center justify-between pb-2 border-b border-borderCol/60">
            <div className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                isPaid ? 'bg-accentGreen' : isCompleted ? 'bg-accentYellow animate-pulse' : 'bg-sky-400 animate-ping'
              }`} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {isAccepted && 'Conductor en camino'}
                {isArrived && '¡Conductor en el sitio!'}
                {isInProgress && 'Viaje en desarrollo'}
                {isCompleted && 'Viaje finalizado - Pago pendiente'}
                {isPaid && 'Viaje completado y pagado'}
              </span>
            </div>
            <span className="text-[11px] font-mono font-semibold text-slate-400">#{ride.id}</span>
          </div>

          {/* Información del Conductor y Vehículo */}
          {ride.driver && (
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-surfaceBg to-borderCol flex items-center justify-center text-accentGreen font-black text-lg border border-borderCol">
                  {ride.driver.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h4 className="font-bold text-white text-sm">{ride.driver.name}</h4>
                    <span className="text-[11px] text-accentYellow font-bold flex items-center">
                      ★ {ride.driver.rating || '4.95'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{ride.driver.model} ({ride.driver.color})</p>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-surfaceBg border border-borderCol text-[10px] font-mono font-bold text-white">
                    Placa: {ride.driver.plate}
                  </span>
                </div>
              </div>

              {/* Botones de Comunicación rápida (Llamada / WhatsApp) */}
              <div className="flex space-x-1.5">
                <a
                  href={`tel:${ride.driver.phone}`}
                  className="w-9 h-9 rounded-full bg-surfaceBg border border-borderCol flex items-center justify-center text-slate-200 active:scale-95 hover:border-accentGreen"
                  title="Llamar al conductor"
                >
                  <Phone className="w-4 h-4 text-accentGreen" />
                </a>
                <a
                  href={`https://wa.me/58${ride.driver.phone.replace(/\D/g, '').replace(/^0/, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-surfaceBg border border-borderCol flex items-center justify-center text-slate-200 active:scale-95 hover:border-accentGreen"
                  title="WhatsApp"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                </a>
              </div>
            </div>
          )}

          {/* Ruta del viaje */}
          <div className="p-2.5 rounded-xl bg-surfaceBg/60 border border-borderCol/60 space-y-1.5 text-xs">
            <div className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-accentGreen mt-1.5 flex-shrink-0" />
              <span className="text-slate-300 line-clamp-1">{ride.pickup?.name || 'Origen fijado'}</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-accentYellow mt-1.5 flex-shrink-0" />
              <span className="text-slate-300 line-clamp-1">{ride.dropoff?.name || 'Destino fijado'}</span>
            </div>
          </div>

          {/* Tarifa y Botón de Pago */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">MONTO TOTAL</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-lg font-black text-white">{formatUsd(ride.fareUsd)}</span>
                <span className="text-xs font-bold text-accentGreen">{formatBs(ride.fareBs)}</span>
              </div>
            </div>

            {/* Acción de Pago */}
            {isPaid ? (
              <div className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-accentGreen border border-accentGreen/30 text-xs font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>Pagado con éxito</span>
              </div>
            ) : ride.payment ? (
              <div className="text-right">
                <span className="text-[11px] font-semibold text-accentYellow block animate-pulse">
                  Verificando pago...
                </span>
                <span className="text-[10px] text-slate-400">Ref: {ride.payment.reference || 'Efectivo'}</span>
              </div>
            ) : (
              <button
                onClick={onOpenPayment}
                className="py-2.5 px-4 rounded-xl bg-accentGreen hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-accentGreen/20 flex items-center space-x-1.5 active:scale-95 transition"
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
