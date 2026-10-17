import React, { useState, useEffect } from 'react';
import {
  Power,
  Navigation,
  DollarSign,
  Award,
  Phone,
  MessageSquare,
  CheckCircle,
  Clock,
  ArrowRight,
  Shield,
  Smartphone,
  Banknote
} from 'lucide-react';
import { RIDE_STATUS, PAYMENT_METHODS } from '../../shared/constants.js';
import { formatUsd, formatBs } from '../utils/formatters.js';

export function DriverDashboard({
  driverProfile,
  isOnline,
  onToggleOnline,
  incomingOffer,
  activeRide,
  onAcceptOffer,
  onRejectOffer,
  onUpdateRideStatus,
  onConfirmPayment
}) {
  const [offerCountdown, setOfferCountdown] = useState(15);

  // Cuenta regresiva para ofertas entrantes
  useEffect(() => {
    if (!incomingOffer) {
      setOfferCountdown(15);
      return;
    }

    const interval = setInterval(() => {
      setOfferCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onRejectOffer(incomingOffer.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [incomingOffer, onRejectOffer]);

  return (
    <div className="space-y-4">
      {/* 1. Barra de Disponibilidad del Conductor */}
      <div className={`p-4 rounded-3xl border transition-all shadow-xl flex items-center justify-between ${
        isOnline
          ? 'bg-gradient-to-r from-cardBg via-surfaceBg to-cardBg border-accentGreen/50 shadow-emerald-500/10'
          : 'bg-cardBg border-borderCol'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
            isOnline ? 'bg-accentGreen text-black shadow-lg shadow-accentGreen/30' : 'bg-surfaceBg text-slate-500'
          }`}>
            <Power className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">
              {isOnline ? 'Conectado — En Línea' : 'Desconectado'}
            </h3>
            <p className="text-xs text-slate-400">
              {isOnline ? 'Listo para recibir solicitudes de viaje' : 'Activa el modo en línea para recibir viajes'}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={onToggleOnline}
          className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none ${
            isOnline ? 'bg-accentGreen' : 'bg-surfaceBg border border-borderCol'
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md ${
              isOnline ? 'translate-x-9' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* 2. Estadísticas Rápidas del Conductor */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 rounded-2xl bg-cardBg border border-borderCol text-center shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hoy</span>
          <span className="text-base font-black text-white">$42.50</span>
          <span className="text-[10px] text-accentGreen block font-semibold">6 carreras</span>
        </div>

        <div className="p-3 rounded-2xl bg-cardBg border border-borderCol text-center shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Calificación</span>
          <div className="flex items-center justify-center space-x-1 text-base font-black text-accentYellow">
            <Award className="w-4 h-4" />
            <span>{driverProfile?.rating || '4.95'}</span>
          </div>
          <span className="text-[10px] text-slate-400 block font-semibold">Excelente</span>
        </div>

        <div className="p-3 rounded-2xl bg-cardBg border border-borderCol text-center shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vehículo</span>
          <span className="text-xs font-bold text-white truncate block mt-0.5">{driverProfile?.model?.split(' ')[0] || 'Moto'}</span>
          <span className="text-[10px] font-mono text-accentGreen font-bold block">{driverProfile?.plate || 'AB123CD'}</span>
        </div>
      </div>

      {/* 3. Oferta de Viaje Entrante (Alerta Flotante con Cuenta Regresiva) */}
      {incomingOffer && !activeRide && (
        <div className="p-5 rounded-3xl bg-cardBg border-2 border-accentYellow shadow-2xl shadow-amber-500/20 animate-bounce-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accentYellow opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-accentYellow"></span>
              </span>
              <h4 className="font-extrabold text-white text-base">¡Nueva Carrera Disponible!</h4>
            </div>
            <div className="flex items-center space-x-1 text-xs font-mono font-bold text-accentYellow bg-surfaceBg px-2 py-1 rounded-full border border-borderCol">
              <Clock className="w-3.5 h-3.5" />
              <span>{offerCountdown}s</span>
            </div>
          </div>

          {/* Tarifa destacada */}
          <div className="p-3.5 rounded-2xl bg-surfaceBg/80 border border-borderCol flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ganancia neta</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-xl font-black text-white">{formatUsd(incomingOffer.fareUsd)}</span>
                <span className="text-xs font-bold text-accentGreen">{formatBs(incomingOffer.fareBs)}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-300 block">{incomingOffer.distanceKm || '3.2'} km</span>
              <span className="text-[11px] text-slate-400 font-medium">~{incomingOffer.estimatedMinutes || '9'} min</span>
            </div>
          </div>

          {/* Ruta */}
          <div className="space-y-2 text-xs">
            <div className="flex items-start space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accentGreen mt-1 flex-shrink-0" />
              <span className="text-slate-300">Recoger: <strong className="text-white">{incomingOffer.pickup?.name}</strong></span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accentYellow mt-1 flex-shrink-0" />
              <span className="text-slate-300">Llevar: <strong className="text-white">{incomingOffer.dropoff?.name}</strong></span>
            </div>
          </div>

          {/* Botones de Aceptar / Rechazar */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onRejectOffer(incomingOffer.id)}
              className="py-3 rounded-2xl bg-surfaceBg hover:bg-surfaceBg/80 border border-borderCol text-slate-300 font-bold text-xs transition active:scale-95"
            >
              Rechazar
            </button>
            <button
              onClick={() => onAcceptOffer(incomingOffer.id)}
              className="py-3 rounded-2xl bg-accentGreen hover:bg-emerald-400 text-black font-extrabold text-sm shadow-xl shadow-accentGreen/25 transition active:scale-95"
            >
              Aceptar Carrera
            </button>
          </div>
        </div>
      )}

      {/* 4. Viaje Activo Asignado */}
      {activeRide && (
        <div className="p-5 rounded-3xl bg-cardBg border border-borderCol shadow-2xl space-y-4 animate-slide-up">
          {/* Cabecera del Viaje */}
          <div className="flex items-center justify-between pb-3 border-b border-borderCol/60">
            <div>
              <span className="text-[10px] font-bold text-accentGreen uppercase tracking-wider block">Carrera en Curso</span>
              <h4 className="font-extrabold text-white text-base">{activeRide.passengerName || 'Pasajero'}</h4>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-white">{formatUsd(activeRide.fareUsd)}</span>
              <span className="text-xs font-bold text-accentGreen block">{formatBs(activeRide.fareBs)}</span>
            </div>
          </div>

          {/* Contacto Pasajero */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-surfaceBg/70 border border-borderCol">
            <div>
              <span className="text-xs text-slate-400">Teléfono:</span>
              <span className="text-xs font-mono font-bold text-white block">{activeRide.passengerPhone || '04121234567'}</span>
            </div>
            <div className="flex space-x-2">
              <a
                href={`tel:${activeRide.passengerPhone || '04121234567'}`}
                className="w-9 h-9 rounded-full bg-surfaceBg border border-borderCol flex items-center justify-center text-accentGreen hover:border-accentGreen active:scale-95"
                title="Llamar"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/58${(activeRide.passengerPhone || '04121234567').replace(/\D/g, '').replace(/^0/, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-surfaceBg border border-borderCol flex items-center justify-center text-emerald-400 hover:border-accentGreen active:scale-95"
                title="WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Ruta */}
          <div className="space-y-1.5 text-xs p-3 rounded-2xl bg-surfaceBg/50 border border-borderCol/60">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-accentGreen" />
              <span className="text-slate-300 truncate">Origen: {activeRide.pickup?.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-accentYellow" />
              <span className="text-slate-300 truncate">Destino: {activeRide.dropoff?.name}</span>
            </div>
          </div>

          {/* Estado de Pago y Botón de Confirmación */}
          {activeRide.payment && activeRide.status !== RIDE_STATUS.PAID && (
            <div className="p-3.5 rounded-2xl bg-surfaceBg border border-accentGreen/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-accentGreen flex items-center space-x-1">
                  {activeRide.payment.method === PAYMENT_METHODS.PAGO_MOVIL ? (
                    <>
                      <Smartphone className="w-4 h-4 mr-1" />
                      <span>Comprobante Pago Móvil</span>
                    </>
                  ) : (
                    <>
                      <Banknote className="w-4 h-4 mr-1" />
                      <span>Pago en Efectivo USD</span>
                    </>
                  )}
                </span>
                <span className="text-[11px] font-bold text-white">
                  {activeRide.payment.method === PAYMENT_METHODS.PAGO_MOVIL
                    ? formatBs(activeRide.payment.amountBs)
                    : formatUsd(activeRide.fareUsd)}
                </span>
              </div>

              {activeRide.payment.method === PAYMENT_METHODS.PAGO_MOVIL ? (
                <div className="text-xs space-y-0.5 text-slate-300">
                  <div>Banco emisor: <strong className="text-white">{activeRide.payment.senderBank}</strong></div>
                  <div>Referencia: <strong className="font-mono text-accentGreen text-sm">{activeRide.payment.reference}</strong></div>
                </div>
              ) : (
                <div className="text-xs text-slate-300">
                  <div>Billete recibido: <strong className="text-white">${activeRide.payment.billReceivedUsd}</strong></div>
                  <div>Vuelto a entregar: <strong className="text-accentYellow text-sm">${activeRide.payment.changeUsd} ({formatBs(activeRide.payment.changeBs)})</strong></div>
                </div>
              )}

              <button
                onClick={() => onConfirmPayment(activeRide.id)}
                className="w-full mt-2 py-3 rounded-2xl bg-accentGreen hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg transition active:scale-98 flex items-center justify-center space-x-1"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirmar Pago Recibido</span>
              </button>
            </div>
          )}

          {/* Botones de Acción Secuenciales del Conductor */}
          <div className="space-y-2 pt-1">
            {activeRide.status === RIDE_STATUS.ACCEPTED && (
              <button
                onClick={() => onUpdateRideStatus(activeRide.id, RIDE_STATUS.ARRIVED)}
                className="w-full py-3.5 rounded-2xl bg-accentYellow hover:bg-amber-400 text-black font-extrabold text-sm shadow-xl transition active:scale-98 flex items-center justify-center space-x-2"
              >
                <Navigation className="w-4 h-4" />
                <span>He Llegado al Punto de Encuentro</span>
              </button>
            )}

            {activeRide.status === RIDE_STATUS.ARRIVED && (
              <button
                onClick={() => onUpdateRideStatus(activeRide.id, RIDE_STATUS.IN_PROGRESS)}
                className="w-full py-3.5 rounded-2xl bg-accentGreen hover:bg-emerald-400 text-black font-extrabold text-sm shadow-xl transition active:scale-98 flex items-center justify-center space-x-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Iniciar Recorrido con el Pasajero</span>
              </button>
            )}

            {activeRide.status === RIDE_STATUS.IN_PROGRESS && (
              <button
                onClick={() => onUpdateRideStatus(activeRide.id, RIDE_STATUS.COMPLETED)}
                className="w-full py-3.5 rounded-2xl bg-accentGreen hover:bg-emerald-400 text-black font-extrabold text-sm shadow-xl transition active:scale-98 flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Llegamos al Destino (Finalizar)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5. Radar de espera cuando está en línea y sin carreras */}
      {isOnline && !incomingOffer && !activeRide && (
        <div className="p-8 rounded-3xl bg-cardBg border border-borderCol text-center space-y-4">
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <span className="absolute w-full h-full rounded-full bg-accentGreen/10 animate-radar" />
            <span className="absolute w-16 h-16 rounded-full bg-accentGreen/20 animate-ping" />
            <div className="w-12 h-12 rounded-full bg-surfaceBg border border-accentGreen flex items-center justify-center shadow-lg">
              <Navigation className="w-5 h-5 text-accentGreen" />
            </div>
          </div>

          <div>
            <h4 className="font-extrabold text-white text-base">Radar de Carreras Activo</h4>
            <p className="text-xs text-slate-400 mt-1">
              Esperando solicitudes de pasajeros en Caracas...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
