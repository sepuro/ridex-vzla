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
  isLiveBcv = true
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
    <header className="fixed top-0 left-0 right-0 z-40 max-w-md mx-auto bg-[#06080D]/85 backdrop-blur-2xl border-b border-white/[0.08] px-3.5 pt-[max(10px,env(safe-area-inset-top))] pb-2.5 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.6)] select-none">
      {/* 1. Logo & Identidad de Marca */}
      <div className="flex items-center space-x-2.5">
        <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-[#00E599] via-[#00F5A0] to-[#00D2FF] p-[1.5px] shadow-[0_0_16px_rgba(0,229,153,0.35)] active:scale-95 transition-transform">
          <div className="w-full h-full bg-[#06080D] rounded-[10px] flex items-center justify-center">
            <span className="font-black text-transparent bg-clip-text bg-gradient-to-tr from-[#00E599] to-[#00D2FF] text-sm tracking-tighter">
              RX
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-black tracking-tight text-white text-base leading-none">
              Ride<span className="text-[#00E599]">X</span>
            </span>
            <span className="text-[9px] bg-white/[0.08] text-slate-300 px-1.5 py-0.5 rounded-md font-bold tracking-wider border border-white/10 uppercase">
              VZLA
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide block -mt-0.5">
            Movilidad Inteligente
          </span>
        </div>
      </div>

      {/* 2. Barra de Acciones: Tasa BCV + Selector Rol + Conectividad */}
      <div className="flex items-center space-x-2">
        {/* Ticker Tasa BCV Oficial */}
        <button
          onClick={handleRateClick}
          className="group flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.12] hover:border-[#00E599]/50 text-slate-200 active:scale-95 transition-all shadow-sm"
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
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all shadow-md active:scale-95 border ${
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
