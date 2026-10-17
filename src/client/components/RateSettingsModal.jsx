import React, { useState } from 'react';
import { X, RefreshCw, CheckCircle2, TrendingUp } from 'lucide-react';

export function RateSettingsModal({
  isOpen,
  onClose,
  currentRate,
  rateSource,
  lastUpdated,
  onUpdateRate,
  onRefreshLive
}) {
  const [inputRate, setInputRate] = useState(currentRate?.toString() || '54.20');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const num = parseFloat(inputRate);
    if (!isNaN(num) && num > 0) {
      onUpdateRate(num);
      setMessage('Tasa actualizada correctamente.');
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 1000);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setMessage('');
    try {
      const updated = await onRefreshLive();
      if (updated && updated.rate) {
        setInputRate(updated.rate.toString());
        setMessage('Tasa sincronizada con BCV Oficial.');
      }
    } catch {
      setMessage('No se pudo conectar con la API externa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-cardBg border border-borderCol p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-borderCol">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-accentGreen" />
            <h3 className="font-bold text-white text-base">Tasa de Cambio Oficial (BCV)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-surfaceBg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="p-3 rounded-xl bg-surfaceBg/60 border border-borderCol/60 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Fuente:</span>
              <span className="text-white font-medium">{rateSource || 'Oficial BCV'}</span>
            </div>
            <div className="flex justify-between text-slate-400 mt-1">
              <span>Última actualización:</span>
              <span className="text-white font-medium">
                {lastUpdated ? new Date(lastUpdated).toLocaleTimeString('es-VE') : 'Hoy'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Valor del Dólar en Bolívares (Bs. / USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-accentGreen">Bs.</span>
                <input
                  type="number"
                  step="0.01"
                  value={inputRate}
                  onChange={(e) => setInputRate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surfaceBg border border-borderCol text-white font-bold text-base focus:outline-none focus:border-accentGreen focus:ring-1 focus:ring-accentGreen"
                  placeholder="54.20"
                />
              </div>
            </div>

            {message && (
              <div className="flex items-center space-x-1.5 text-xs text-accentGreen">
                <CheckCircle2 className="w-4 h-4" />
                <span>{message}</span>
              </div>
            )}

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-surfaceBg hover:bg-surfaceBg/80 border border-borderCol text-xs font-semibold text-slate-200 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-accentYellow ${loading ? 'animate-spin' : ''}`} />
                <span>Actualizar API</span>
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-3 rounded-xl bg-accentGreen hover:bg-emerald-400 text-black font-bold text-xs shadow-md transition"
              >
                Guardar Tasa
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
