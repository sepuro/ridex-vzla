import React from 'react';
import { Bike, Car, Sparkles, Clock, Check, Users, Shield, CheckCircle2 } from 'lucide-react';
import { VEHICLE_TYPES, VEHICLE_CONFIGS } from '../../shared/constants.js';
import { calculateFare } from '../utils/pricing.js';
import { formatUsd, formatBs } from '../utils/formatters.js';
import { triggerHaptic } from '../utils/soundEffects.js';

export function VehicleSelector({
  selectedType,
  onSelectType,
  distanceKm,
  bcvRate
}) {
  const vehicles = [
    {
      type: VEHICLE_TYPES.MOTO,
      config: VEHICLE_CONFIGS[VEHICLE_TYPES.MOTO],
      icon: Bike,
      badge: '⚡ Más Rápido',
      tagColor: 'bg-[#FFB800]/15 text-[#FFB800] border-[#FFB800]/30',
      activeBorder: 'border-[#FFB800]',
      activeBg: 'bg-gradient-to-r from-[#FFB800]/15 to-transparent',
      glow: 'shadow-[0_0_20px_rgba(255,184,0,0.2)]'
    },
    {
      type: VEHICLE_TYPES.CARRO_STANDARD,
      config: VEHICLE_CONFIGS[VEHICLE_TYPES.CARRO_STANDARD],
      icon: Car,
      badge: '👍 Recomendado',
      tagColor: 'bg-[#00D2FF]/15 text-[#00D2FF] border-[#00D2FF]/30',
      activeBorder: 'border-[#00D2FF]',
      activeBg: 'bg-gradient-to-r from-[#00D2FF]/15 to-transparent',
      glow: 'shadow-[0_0_20px_rgba(0,210,255,0.2)]'
    },
    {
      type: VEHICLE_TYPES.CARRO_CONFORT,
      config: VEHICLE_CONFIGS[VEHICLE_TYPES.CARRO_CONFORT],
      icon: Sparkles,
      badge: '❄️ A/C Full',
      tagColor: 'bg-[#00E599]/15 text-[#00E599] border-[#00E599]/30',
      activeBorder: 'border-[#00E599]',
      activeBg: 'bg-gradient-to-r from-[#00E599]/15 to-transparent',
      glow: 'shadow-[0_0_20px_rgba(0,229,153,0.2)]'
    }
  ];

  return (
    <div className="space-y-2 select-none">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
          Elige tu vehículo
        </h4>
        <span className="text-[10px] text-slate-400 font-medium">
          Tasa BCV: <strong className="text-[#00E599] font-black">Bs. {typeof bcvRate === 'number' ? bcvRate.toFixed(2) : bcvRate}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {vehicles.map(({ type, config, icon: IconComponent, badge, tagColor, activeBorder, activeBg, glow }) => {
          const fare = calculateFare({ distanceKm, vehicleType: type, bcvRate });
          const isSelected = selectedType === type;

          return (
            <button
              key={type}
              onClick={() => {
                triggerHaptic(40);
                onSelectType(type);
              }}
              className={`w-full text-left p-3.5 rounded-2xl transition-all duration-200 border flex items-center justify-between backdrop-blur-xl relative overflow-hidden active:scale-[0.98] ${
                isSelected
                  ? `${activeBg} ${activeBorder} ${glow} ring-1 ring-white/20 bg-[#0E1420]`
                  : 'bg-[#0D111A]/90 border-white/[0.08] hover:border-white/20 hover:bg-[#141A26]'
              }`}
            >
              {/* Highlight bar para vehículo seleccionado */}
              {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#00E599] to-[#00D2FF]" />
              )}

              {/* Icono y Detalles */}
              <div className="flex items-center space-x-3.5 pl-1">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform ${
                    isSelected
                      ? 'bg-white/10 text-white scale-105 shadow-inner border border-white/10'
                      : 'bg-white/[0.04] text-slate-400 border border-white/[0.04]'
                  }`}
                >
                  <IconComponent className="w-6 h-6 stroke-[2.2]" />
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-white text-sm">{config.name}</span>
                    {badge && (
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${tagColor}`}>
                        {badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{config.subtitle}</p>
                  <div className="flex items-center space-x-2 mt-1 text-[10px] text-slate-400 font-semibold">
                    <span className="flex items-center text-slate-300">
                      <Clock className="w-3 h-3 mr-0.5 text-slate-400" />
                      {fare.estimatedMinutes} min
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Users className="w-3 h-3 mr-0.5 text-slate-400" />
                      {config.capacity} {config.capacity === 1 ? 'persona' : 'personas'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Precios en USD y Bs */}
              <div className="text-right pl-2 flex flex-col items-end justify-center">
                <div className="text-base font-black text-white tracking-tight flex items-center space-x-1.5">
                  <span>{formatUsd(fare.fareUsd)}</span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-[#00E599] stroke-[2.5]" />
                  )}
                </div>
                <div className="text-xs font-black text-[#00E599] mt-0.5">
                  {formatBs(fare.fareBs)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
