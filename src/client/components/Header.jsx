import React from 'react';
import { DollarSign, User, Car, Wifi, WifiOff } from 'lucide-react';

export function Header({
  role,
  onToggleRole,
  bcvRate,
  onOpenRateModal,
  connected
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-cardBg/90 backdrop-blur-md border-b border-borderCol px-4 py-2.5 flex items-center justify-between shadow-lg">
      {/* Logo & Marca */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accentGreen to-emerald-400 flex items-center justify-center font-black text-black text-lg shadow-sm">
          R
        </div>
        <div>
          <span className="font-extrabold tracking-tight text-white text-base">Ride<span className="text-accentGreen">X</span></span>
          <span className="text-[10px] text-slate-400 block -mt-1 font-semibold tracking-wider">VENEZUELA</span>
        </div>
      </div>

      {/* Selector de Rol y Tasa BCV */}
      <div className="flex items-center space-x-2">
        {/* Tasa BCV Button */}
        <button
          onClick={onOpenRateModal}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-surfaceBg border border-borderCol text-xs text-slate-200 active:scale-95 transition hover:border-accentGreen/50"
          title="Tasa oficial de cambio BCV"
        >
          <DollarSign className="w-3.5 h-3.5 text-accentGreen" />
          <span className="font-semibold text-[11px]">BCV: Bs. {bcvRate?.toFixed(2) || '54.20'}</span>
        </button>

        {/* Switch Pasajero / Conductor */}
        <button
          onClick={onToggleRole}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 ${
            role === 'driver'
              ? 'bg-accentYellow text-black shadow-amber-500/20'
              : 'bg-accentGreen text-black shadow-emerald-500/20'
          }`}
        >
          {role === 'driver' ? (
            <>
              <Car className="w-3.5 h-3.5" />
              <span>Conductor</span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5" />
              <span>Pasajero</span>
            </>
          )}
        </button>

        {/* Indicador de Conexión */}
        <div className="flex items-center pl-1" title={connected ? 'Conectado en tiempo real' : 'Reconectando...'}>
          {connected ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accentGreen opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accentGreen"></span>
            </span>
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-dangerRed animate-pulse" />
          )}
        </div>
      </div>
    </header>
  );
}
