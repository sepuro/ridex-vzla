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
  Banknote,
  Sparkles,
  MapPin,
  TrendingUp
} from 'lucide-react';
import { RIDE_STATUS, PAYMENT_METHODS } from '../../shared/constants.js';
import { formatUsd, formatBs } from '../utils/formatters.js';
import { triggerHaptic } from '../utils/soundEffects.js';

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
    <div className="space-y-4 select-none">
      {/* 1. Barra de Disponibilidad del Conductor */}
      <div
        className={`p-4 rounded-3xl border transition-all duration-300 shadow-xl flex items-center justify-between relative overflow-hidden ${
          isOnline
            ? 'bg-gradient-to-r from-[#0D1420] via-[#101D2E] to-[#0D1420] border-[#00E599]/40 shadow-[0_0_25px_rgba(0,229,153,0.15)]'
            : 'bg-[#0D111A] border-white/[0.08]'
        }`}
      >
        <div className="flex items-center space-x-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${
              isOnline
                ? 'bg-gradient-to-tr from-[#00E599] to-[#00D2FF] text-black shadow-lg shadow-[#00E599]/30'
                : 'bg-white/[0.05] text-slate-500'
            }`}
          >
            <Power className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-black text-white text-base">
                {isOnline ? 'Conectado — En Línea' : 'Desconectado'}
              </h3>
              {isOnline && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E599] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E599]"></span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {isOnline ? 'Listo para recibir solicitudes de viaje' : 'Activa el modo en línea para recibir viajes'}
            </p>
          </div>
        </div>

        {/* Master Toggle Switch */}
        <button
          onClick={() => {
            triggerHaptic(50);
            onToggleOnline();
          }}
          className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none p-1 ${
            isOnline ? 'bg-[#00E599]' : 'bg-white/[0.1] border border-white/[0.1]'
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 shadow-md ${
              isOnline ? 'translate-x-8 bg-black' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* 2. Estadísticas Rápidas del Conductor */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-[#0D111A] border border-white/[0.08] text-center shadow-md">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Hoy</span>
          <span className="text-base font-black text-white">$42.50</span>
          <span className="text-[10px] text-[#00E599] block font-bold">6 carreras</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0D111A] border border-white/[0.08] text-center shadow-md">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Aceptación</span>
          <span className="text-base font-black text-[#00D2FF]">98%</span>
          <span className="text-[10px] text-slate-400 block font-semibold">Excelente</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0D111A] border border-white/[0.08] text-center shadow-md">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Calificación</span>
          <span className="text-base font-black text-[#FFB800] flex items-center justify-center">
            ★ {driverProfile.rating || 5.0}
          </span>
          <span className="text-[10px] text-slate-400 block font-semibold">Verificado</span>
        </div>
      </div>

      {/* 3. Oferta Entrante de Viaje (Modal / Alerta Flotante) */}
      {incomingOffer && (
        <div className="p-4 rounded-3xl bg-gradient-to-b from-[#121A2A] to-[#0A0F1A] border-2 border-[#00E599] shadow-[0_0_35px_rgba(0,229,153,0.3)] space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-full bg-[#00E599]/20 text-[#00E599] flex items-center justify-center font-black text-sm">
                ⚡
              </span>
              <div>
                <h4 className="font-black text-white text-base">¡Nueva Carrera Disponible!</h4>
                <p className="text-xs text-slate-400">Solicitud de pasajero cercano</p>
              </div>
            </div>

            {/* Contador Circular de Segundos */}
            <div className="w-10 h-10 rounded-full border-2 border-[#00E599] flex items-center justify-center font-black text-white text-sm bg-black/40">
              {offerCountdown}s
            </div>
          </div>

          {/* Rutas y Tarifas */}
          <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E599]" />
              <p className="text-slate-300 font-medium truncate">{incomingOffer.pickup?.name}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B5C]" />
              <p className="text-slate-300 font-medium truncate">{incomingOffer.dropoff?.name}</p>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 text-xs">
            <span className="text-slate-400">Ganancia neta:</span>
            <div className="text-right">
              <span className="font-black text-white text-lg">{formatUsd(incomingOffer.fareUsd)}</span>
              <span className="font-bold text-[#00E599] ml-1">({formatBs(incomingOffer.fareBs)})</span>
            </div>
          </div>

          {/* Botones de Aceptar o Rechazar */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => {
                triggerHaptic(30);
                onRejectOffer(incomingOffer.id);
              }}
              className="py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-bold text-xs transition active:scale-95"
            >
              Rechazar
            </button>
            <button
              onClick={() => {
                triggerHaptic(80);
                onAcceptOffer(incomingOffer.id);
              }}
              className="py-3 rounded-2xl bg-gradient-to-r from-[#00E599] to-[#00D2FF] text-black font-black text-xs shadow-lg shadow-[#00E599]/30 transition active:scale-95 flex items-center justify-center space-x-1"
            >
              <span>ACEPTAR CARRERA</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* 4. Viaje Activo para el Conductor */}
      {activeRide && (
        <div className="p-4 rounded-3xl bg-[#0D111A] border border-white/[0.12] shadow-2xl space-y-4 animate-slide-up">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div>
              <span className="text-[10px] font-black text-[#00E599] uppercase tracking-wider block">
                Viaje en Curso
              </span>
              <h4 className="font-black text-white text-base">
                {activeRide.passenger?.name || 'Pasajero RideX'}
              </h4>
            </div>

            <a
              href={`tel:${activeRide.passenger?.phone || '04141234567'}`}
              className="w-10 h-10 rounded-2xl bg-[#00D2FF]/15 text-[#00D2FF] flex items-center justify-center border border-[#00D2FF]/30 active:scale-95 transition"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>

          {/* Botones de Progresión del Viaje */}
          <div className="space-y-2">
            {activeRide.status === RIDE_STATUS.ACCEPTED && (
              <button
                onClick={() => {
                  triggerHaptic(60);
                  onUpdateRideStatus(activeRide.id, RIDE_STATUS.ARRIVED);
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00D2FF] to-blue-500 text-black font-black text-xs shadow-lg shadow-[#00D2FF]/20 active:scale-95 transition"
              >
                He llegado al sitio de recogida
              </button>
            )}

            {activeRide.status === RIDE_STATUS.ARRIVED && (
              <button
                onClick={() => {
                  triggerHaptic(60);
                  onUpdateRideStatus(activeRide.id, RIDE_STATUS.IN_PROGRESS);
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00E599] to-[#00D2FF] text-black font-black text-xs shadow-lg shadow-[#00E599]/20 active:scale-95 transition"
              >
                Iniciar Recorrido con el Pasajero
              </button>
            )}

            {activeRide.status === RIDE_STATUS.IN_PROGRESS && (
              <button
                onClick={() => {
                  triggerHaptic(60);
                  onUpdateRideStatus(activeRide.id, RIDE_STATUS.COMPLETED);
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FFB800] to-amber-500 text-black font-black text-xs shadow-lg shadow-[#FFB800]/20 active:scale-95 transition"
              >
                Finalizar Carrera en Destino
              </button>
            )}

            {activeRide.status === RIDE_STATUS.COMPLETED && (
              <button
                onClick={() => {
                  triggerHaptic(80);
                  onConfirmPayment(activeRide.id);
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00E599] to-[#00F5A0] text-black font-black text-xs shadow-lg shadow-[#00E599]/30 active:scale-95 transition"
              >
                Confirmar Pago Recibido (${activeRide.fareUsd?.toFixed(2)})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
