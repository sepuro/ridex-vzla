import React from 'react';
import { DollarSign, User, Car, Wifi, WifiOff, RefreshCw } from 'lucide-react';

export function Header({
  role,
  onToggleRole,
  bcvRate,
  onOpenRateModal,
  connected,
  rateSource = 'BCV Oficial',
  isLiveBcv = true
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 max-w-md mx-auto bg-[#0a0e17]/85 backdrop-blur-2xl border-b border-white/10 px-3.5 pt-[max(10px,env(safe-area-inset-top))] pb-2.5 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
      {/* Logo & Marca con acentos Pixel y estética iPhone */}
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-pixel-green to-emerald-400 flex items-center justify-center font-black text-black text-base shadow-[0_0_15px_rgba(52,168,83,0.4)] border border-white/20">
          R
        </div>
        <div>
          <div className="flex items-center space-x-1">
            <span className="font-black tracking-tight text-white text-base">Ride<span className="text-pixel-greenLight">X</span></span>
            <span className="text-[9px] bg-pixel-containerHigh text-slate-300 px-1.5 py-0.2 rounded-full font-bold border border-white/10">VZLA</span>
          </div>
          <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium tracking-wide">Movilidad Inteligente</span>
        </div>
      </div>

      {/* Acciones: Tasa Oficial BCV + Switch Rol + Estado Conexión */}
      <div className="flex items-center space-x-2">
        {/* Tasa BCV Pill en Vivo */}
        <button
          onClick={onOpenRateModal}
          className="group flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full bg-slate-900/80 border border-white/15 hover:border-pixel-greenLight/60 text-slate-200 active:scale-95 transition-all shadow-sm"
          title="Tasa oficial de cambio BCV - Toca para detalles"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pixel-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-pixel-green"></span>
          </span>
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">BCV</span>
            <span className="font-extrabold text-[11px] text-white leading-tight">
              Bs. {typeof bcvRate === 'number' ? bcvRate.toFixed(2) : (bcvRate || '880.12')}
            </span>
          </div>
        </button>

        {/* Switch Cupertino / Pixel de Rol Pasajero vs Conductor */}
        <button
          onClick={onToggleRole}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 border ${
            role === 'driver'
              ? 'bg-pixel-yellow text-black border-amber-300/40 shadow-amber-500/20'
              : 'bg-pixel-green text-black border-emerald-300/40 shadow-emerald-500/20'
          }`}
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
          title={connected ? 'Conexión en tiempo real activa' : 'Reconectando con el servidor...'}
        >
          {connected ? (
            <div className="w-2.5 h-2.5 rounded-full bg-pixel-greenLight shadow-[0_0_8px_rgba(129,201,149,0.9)]" />
          ) : (
            <WifiOff className="w-4 h-4 text-pixel-red animate-pulse" />
          )}
        </div>
      </div>
    </header>
  );
}

