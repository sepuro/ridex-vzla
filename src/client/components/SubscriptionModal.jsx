import React, { useState } from 'react';
import {
  X,
  Crown,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  CreditCard,
  Calendar,
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../../shared/constants.js';
import { formatUsd, formatBs } from '../utils/formatters.js';
import { triggerHaptic, playAcceptChime } from '../utils/soundEffects.js';

export function SubscriptionModal({
  isOpen,
  onClose,
  currentUser,
  bcvRate,
  onSubscriptionUpdated
}) {
  const [selectedPlanId, setSelectedPlanId] = useState('pass_vip_monthly');
  const [paymentSource, setPaymentSource] = useState('wallet'); // 'wallet' | 'pago_movil'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const isVip = Boolean(currentUser?.isVip);
  const subscription = currentUser?.subscription;
  const monthlyPlan = SUBSCRIPTION_PLANS.MONTHLY;
  const annualPlan = SUBSCRIPTION_PLANS.ANNUAL;
  const activePlan = selectedPlanId === 'pass_vip_annual' ? annualPlan : monthlyPlan;

  const handleSubscribe = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('ridex_token');
      const res = await fetch('/api/subscription/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ planId: selectedPlanId })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo procesar la suscripción');
      }

      playAcceptChime();
      triggerHaptic([100, 50, 150]);
      setSuccessMsg('¡Felicidades! Tu RideX Pass VIP ya está activo.');

      if (data.user) {
        localStorage.setItem('ridex_user', JSON.stringify(data.user));
        if (onSubscriptionUpdated) {
          onSubscriptionUpdated(data.user);
        }
      }

      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message);
      triggerHaptic(150);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('¿Estás seguro de que deseas cancelar la renovación automática de RideX Pass?')) {
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('ridex_token');
      const res = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo cancelar la suscripción');
      }

      triggerHaptic(80);
      setSuccessMsg('Tu suscripción ha sido cancelada.');

      if (data.user) {
        localStorage.setItem('ridex_user', JSON.stringify(data.user));
        if (onSubscriptionUpdated) {
          onSubscriptionUpdated(data.user);
        }
      }

      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0D111A] border-t sm:border border-white/[0.12] rounded-t-[32px] sm:rounded-3xl shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Luces de fondo ambient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00E599]/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Encabezado con Botón Cerrar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] relative z-10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-md shadow-amber-500/20">
              <Crown className="w-4 h-4 text-black font-black" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center space-x-1.5">
                <span>RideX Pass</span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  VIP
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Máximo ahorro y prioridad en toda Venezuela</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 relative z-10">
          {errorMsg && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-[#00E599]/10 border border-[#00E599]/30 text-[#00E599] text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Tarjeta de Estado si ya es VIP */}
          {isVip && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-[#141A26] to-[#0D111A] border border-amber-500/30 shadow-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-xs font-bold text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Tu suscripción está activa</span>
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#00E599]/20 text-[#00E599] border border-[#00E599]/40">
                  ACTIVO
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Plan: <strong className="text-white">{subscription?.planName || 'RideX Pass'}</strong>
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/[0.08]">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Vence: {new Date(subscription?.expiresAt).toLocaleDateString('es-VE')}</span>
                </span>
                <span>15% OFF Activo</span>
              </div>
            </div>
          )}

          {/* Selector de Planes (Mensual vs Anual) */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
              Selecciona tu Membresía
            </span>
            <div className="grid grid-cols-2 gap-3">
              {/* Opción Mensual */}
              <div
                onClick={() => {
                  setSelectedPlanId('pass_vip_monthly');
                  triggerHaptic(40);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  selectedPlanId === 'pass_vip_monthly'
                    ? 'bg-[#141A26] border-[#00E599] shadow-[0_0_20px_rgba(0,229,153,0.2)]'
                    : 'bg-[#06080D]/60 border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-white block">Plan Mensual</span>
                  <div className="mt-1">
                    <span className="text-xl font-black text-white">{formatUsd(monthlyPlan.priceUsd)}</span>
                    <span className="text-[10px] text-slate-400 font-medium"> /mes</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    ({formatBs(monthlyPlan.priceUsd * bcvRate)})
                  </span>
                </div>
                <div className="mt-3 pt-2 border-t border-white/[0.06] text-[10px] font-bold text-[#00E599]">
                  15% OFF Viajes & Envíos
                </div>
              </div>

              {/* Opción Anual con Descuento */}
              <div
                onClick={() => {
                  setSelectedPlanId('pass_vip_annual');
                  triggerHaptic(40);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  selectedPlanId === 'pass_vip_annual'
                    ? 'bg-[#141A26] border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.2)]'
                    : 'bg-[#06080D]/60 border-white/[0.08] hover:border-white/20'
                }`}
              >
                {/* Badge Ahorro */}
                <div className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-[9px] uppercase tracking-tight shadow-md">
                  Ahorra 33%
                </div>

                <div>
                  <span className="text-xs font-bold text-white block">Plan Anual</span>
                  <div className="mt-1">
                    <span className="text-xl font-black text-white">{formatUsd(annualPlan.priceUsd)}</span>
                    <span className="text-[10px] text-slate-400 font-medium"> /año</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    ({formatBs(annualPlan.priceUsd * bcvRate)})
                  </span>
                </div>
                <div className="mt-3 pt-2 border-t border-white/[0.06] text-[10px] font-bold text-amber-300">
                  2 Meses Gratis incluidos
                </div>
              </div>
            </div>
          </div>

          {/* Beneficios VIP Detallados */}
          <div className="p-4 rounded-2xl bg-[#06080D]/80 border border-white/[0.08] space-y-3">
            <span className="text-xs font-bold text-white flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Beneficios Exclusivos RideX VIP</span>
            </span>

            <div className="space-y-2 text-xs">
              {activePlan.perks.map((perk, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#00E599] flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{perk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selección de Método de Pago */}
          {!isVip && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
                Método de Cobro
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentSource('wallet')}
                  className={`p-3 rounded-xl border text-left flex items-center space-x-2 transition ${
                    paymentSource === 'wallet'
                      ? 'bg-[#141A26] border-[#00E599] text-white'
                      : 'bg-[#06080D]/50 border-white/[0.08] text-slate-400'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#00E599]" />
                  <div>
                    <span className="text-xs font-bold block">Billetera RideX</span>
                    <span className="text-[10px] text-slate-400">Saldo prepagado</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentSource('pago_movil')}
                  className={`p-3 rounded-xl border text-left flex items-center space-x-2 transition ${
                    paymentSource === 'pago_movil'
                      ? 'bg-[#141A26] border-[#00E599] text-white'
                      : 'bg-[#06080D]/50 border-white/[0.08] text-slate-400'
                  }`}
                >
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <div>
                    <span className="text-xs font-bold block">Pago Móvil BDV</span>
                    <span className="text-[10px] text-slate-400">Directo en Bs.</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Botones de Acción */}
        <div className="pt-3 border-t border-white/[0.08] space-y-2 relative z-10">
          {!isVip ? (
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-[#00E599] text-black font-black text-sm tracking-wide shadow-xl shadow-amber-500/20 active:scale-[0.98] transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Crown className="w-4 h-4 fill-black" />
              <span>
                {loading ? 'Activando Membresía...' : `ACTIVAR RIDEX PASS • ${formatUsd(activePlan.priceUsd)}`}
              </span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-white/[0.06] hover:bg-rose-500/20 border border-white/[0.1] hover:border-rose-500/40 text-rose-300 font-bold text-xs transition active:scale-95"
              >
                {loading ? 'Procesando...' : 'Cancelar Renovación'}
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-white/[0.1] hover:bg-white/[0.16] text-white font-bold text-xs transition active:scale-95"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
