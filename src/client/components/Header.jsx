import React from 'react';
import { DollarSign, User, Car, Wifi, WifiOff, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../utils/soundEffects.js';

export function Header({
  role,
  onToggleRole,
  bcvRate,
  onOpenRateModal,
  connected,
  rateSource = 'BCV Oficial',
  isLiveBcv = true,
  isVip = false,
  onOpenVipModal
}) {
  const handleToggle = () => {
    triggerHaptic(40);
    onToggleRole();
  };

  const handleRateClick = () => {
    triggerHaptic(30);
    onOpenRateModal();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 max-w-md mx-auto bg-[#06080D]/80 backdrop-blur-2xl border-b border-white/[0.06] px-3.5 pt-[max(10px,env(safe-area-inset-top))] pb-2.5 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.55)] select-none">
      {/* 1. Logo & Identidad de Marca */}
      <div className="flex items-center space-x-2.5">
        <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-[0_0_18px_rgba(0,229,153,0.35)] tap-scale border border-white/10 flex-shrink-0">
          <img
            src="/icons/icon.svg"
            alt="RideX"
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-black tracking-tight text-white text-base leading-none">
              Ride<span className="text-[#00E599]">X</span>
            </span>
            <span className="text-[9px] bg-white/[0.08] text-slate-300 px-1.5 py-0.5 rounded-md font-extrabold tracking-wider border border-white/10 uppercase">
              VZLA
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide block -mt-0.5">
            Movilidad Urbana
          </span>
        </div>
      </div>

      {/* 2. Barra de Acciones: VIP + Tasa BCV + Selector Rol + Conectividad */}
      <div className="flex items-center space-x-2">
        {/* Distintivo / Botón RideX Pass VIP */}
        {role === 'passenger' && (
          <button
            onClick={() => {
              triggerHaptic(30);
              if (onOpenVipModal) onOpenVipModal();
            }}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-full text-[10px] font-black tracking-wider tap-scale transition-[background-color,border-color,color] duration-140 border ${
              isVip
                ? 'bg-gradient-to-r from-amber-500/20 to-yellow-400/20 text-amber-300 border-amber-400/60 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/10 hover:border-amber-400/40'
            }`}
            title={isVip ? 'RideX Pass VIP Activo (15% OFF)' : 'Obtén 15% OFF con RideX Pass VIP'}
          >
            <Sparkles className={`w-3 h-3 ${isVip ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-400'}`} />
            <span>{isVip ? 'VIP' : 'PASS'}</span>
          </button>
        )}

        {/* Ticker Tasa BCV Oficial */}
        <button
          onClick={handleRateClick}
          className="group flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.12] hover:border-[#00E599]/50 text-slate-200 tap-scale transition-[background-color,border-color] duration-140 shadow-sm"
          title="Tasa de cambio oficial BCV. Toca para ver detalles o ajustar."
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E599] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E599]"></span>
          </span>
          <div className="flex flex-col text-left">
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider leading-none">
              BCV
            </span>
            <span className="font-extrabold text-[11px] text-white leading-tight">
              Bs. {typeof bcvRate === 'number' ? bcvRate.toFixed(2) : (bcvRate || '880.12')}
            </span>
          </div>
        </button>

        {/* Switch de Rol: Pasajero / Conductor */}
        <button
          onClick={handleToggle}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-black tap-scale transition-[background-image,box-shadow,border-color] duration-180 shadow-md border ${
            role === 'driver'
              ? 'bg-gradient-to-r from-[#FFB800] to-[#FFA000] text-black border-amber-300/40 shadow-amber-500/20'
              : 'bg-gradient-to-r from-[#00E599] to-[#00D2FF] text-black border-emerald-300/40 shadow-emerald-500/20'
          }`}
          title={role === 'driver' ? 'Modo Conductor activo. Toca para cambiar a Pasajero' : 'Modo Pasajero activo. Toca para cambiar a Conductor'}
        >
          {role === 'driver' ? (
            <>
              <Car className="w-3.5 h-3.5 fill-current" />
              <span>Conductor</span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Pasajero</span>
            </>
          )}
        </button>

        {/* Indicador de Conexión en Tiempo Real */}
        <div
          className="flex items-center pl-0.5"
          title={connected ? 'Conexión WebSocket activa en tiempo real' : 'Reconectando con el servidor RideX...'}
        >
          {connected ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E599] opacity-40"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00E599] shadow-[0_0_10px_rgba(0,229,153,0.9)]"></span>
            </span>
          ) : (
            <WifiOff className="w-4 h-4 text-[#FF3B5C] animate-pulse" />
          )}
        </div>
      </div>
    </header>
  );
}
