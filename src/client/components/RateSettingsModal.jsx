import React, { useState } from 'react';
import { X, RefreshCw, CheckCircle2, TrendingUp, ShieldCheck, DollarSign, Calculator, AlertCircle } from 'lucide-react';
import { triggerHaptic } from '../utils/soundEffects.js';

export function RateSettingsModal({
  isOpen,
  onClose,
  currentRate,
  rateSource = 'Banco Central de Venezuela (BCV)',
  lastUpdated,
  officialDate,
  changePercent = 0.0,
  onUpdateRate,
  onRefreshLive
}) {
  const [inputRate, setInputRate] = useState(currentRate?.toString() || '880.12');
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [showManualOverride, setShowManualOverride] = useState(false);

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setLoading(true);
    setSyncStatus(null);
    triggerHaptic(50);
    try {
      const updated = await onRefreshLive();
      if (updated && updated.rate) {
        setInputRate(updated.rate.toString());
        setSyncStatus({
          type: 'success',
          message: `Sincronizado con BCV Oficial: Bs. ${Number(updated.rate).toFixed(2)}`
        });
        triggerHaptic(80);
      } else {
        setSyncStatus({
          type: 'error',
          message: 'No se pudo obtener la tasa en vivo. Conservando valor actual.'
        });
      }
    } catch {
      setSyncStatus({
        type: 'error',
        message: 'Error de conexión. Verifique su red móvil.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveManual = (e) => {
    e.preventDefault();
    const num = parseFloat(inputRate);
    if (!isNaN(num) && num > 0) {
      onUpdateRate(num);
      triggerHaptic(60);
      setSyncStatus({
        type: 'success',
        message: 'Tasa personalizada guardada correctamente.'
      });
      setTimeout(() => {
        onClose();
      }, 900);
    }
  };

  const activeRateNum = typeof currentRate === 'number' ? currentRate : parseFloat(currentRate) || 880.12;
  const quickConversions = [1, 5, 10, 20, 50];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in safe-area-pb select-none">
      <div className="w-full max-w-sm rounded-[28px] bg-[#0D111A] border border-white/15 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl text-slate-100 space-y-4">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#00E599]/20 border border-[#00E599]/40 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#00E599]" />
            </div>
            <div>
              <h3 className="font-black text-white text-sm">Banco Central de Venezuela</h3>
              <p className="text-[10px] text-slate-400 font-medium">Tasa Oficial Referencial (BCV)</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic(30);
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white transition active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tarjeta de Tasa Oficial Activa */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] shadow-inner space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse" />
              <span className="font-semibold text-slate-300">Dólar Oficial (USD)</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#00E599]/15 text-[#00E599] text-[10px] font-bold border border-[#00E599]/30">
              {changePercent >= 0 ? `+${changePercent}%` : `${changePercent}%`} 24h
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white tracking-tight">
              Bs. {activeRateNum.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-400 font-bold">/ 1.00 USD</span>
          </div>

          <div className="text-[11px] text-slate-400 pt-1 border-t border-white/[0.05] flex items-center justify-between">
            <span>Fecha Valor BCV:</span>
            <span className="text-white font-medium">
              {officialDate ? new Date(officialDate).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Actualizado hoy'}
            </span>
          </div>
        </div>

        {/* Botón Sincronizar en Vivo */}
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#00D2FF] to-blue-500 hover:brightness-105 active:scale-95 transition text-black font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-[#00D2FF]/20 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Consultando al BCV en tiempo real...' : 'Sincronizar con el BCV Oficial'}</span>
        </button>

        {syncStatus && (
          <div className={`p-2.5 rounded-xl text-xs flex items-center space-x-2 border ${
            syncStatus.type === 'success'
              ? 'bg-[#00E599]/15 text-[#00E599] border-[#00E599]/30'
              : 'bg-[#FF3B5C]/15 text-[#FF7088] border-[#FF3B5C]/30'
          }`}>
            {syncStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="font-medium text-[11px]">{syncStatus.message}</span>
          </div>
        )}

        {/* Tabla de Conversión Rápida Oficial */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-semibold">
            <span className="flex items-center space-x-1">
              <Calculator className="w-3 h-3 text-[#FFB800]" />
              <span>Conversión Directa</span>
            </span>
            <span>Tasa BCV del día</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 text-center">
            {quickConversions.map((usd) => (
              <div key={usd} className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <span className="block text-[10px] text-slate-400 font-bold">${usd}</span>
                <span className="block text-[10px] font-black text-white mt-0.5">
                  {(usd * activeRateNum).toFixed(0)} Bs
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Toggle para Ajuste Manual Opcional */}
        <div className="pt-1 border-t border-white/[0.08]">
          {!showManualOverride ? (
            <button
              onClick={() => setShowManualOverride(true)}
              className="text-[11px] text-slate-400 hover:text-white transition w-full text-center font-medium"
            >
              ¿Necesitas ajustar la tasa manualmente? Haz clic aquí
            </button>
          ) : (
            <form onSubmit={handleSaveManual} className="space-y-2 mt-2">
              <label className="block text-[11px] font-bold text-slate-300">
                Tasa manual personalizada (Bs / USD):
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  step="0.01"
                  value={inputRate}
                  onChange={(e) => setInputRate(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono font-bold text-xs focus:outline-none focus:border-[#00E599]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00E599] text-black font-black text-xs active:scale-95 transition"
                >
                  Guardar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
