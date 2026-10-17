import React from 'react';
import { Bike, Car, Sparkles, Clock, Check, Users } from 'lucide-react';
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
      badge: 'Más Rápido',
      accentColor: 'text-pixel-yellowLight',
      borderColor: 'border-pixel-yellowLight/40',
      activeBg: 'bg-pixel-yellow/10'
    },
    {
      type: VEHICLE_TYPES.CARRO_STANDARD,
      config: VEHICLE_CONFIGS[VEHICLE_TYPES.CARRO_STANDARD],
      icon: Car,
      badge: 'Recomendado',
      accentColor: 'text-pixel-blueLight',
      borderColor: 'border-pixel-blueLight/40',
      activeBg: 'bg-pixel-blue/10'
    },
    {
      type: VEHICLE_TYPES.CARRO_CONFORT,
      config: VEHICLE_CONFIGS[VEHICLE_TYPES.CARRO_CONFORT],
      icon: Sparkles,
      badge: '❄️ Con A/C',
      accentColor: 'text-pixel-greenLight',
      borderColor: 'border-pixel-greenLight/40',
      activeBg: 'bg-pixel-green/10'
    }
  ];

  return (
    <div className="space-y-2 select-none">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          Elige tu vehículo
        </h4>
        <span className="text-[10px] text-slate-400 font-semibold">
          Cotizado a tasa BCV: <strong className="text-pixel-greenLight">Bs. {typeof bcvRate === 'number' ? bcvRate.toFixed(2) : bcvRate}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {vehicles.map(({ type, config, icon: IconComponent, badge, accentColor, borderColor, activeBg }) => {
          const fare = calculateFare({ distanceKm, vehicleType: type, bcvRate });
          const isSelected = selectedType === type;

          return (
            <button
              key={type}
              onClick={() => {
                triggerHaptic(40);
                onSelectType(type);
              }}
              className={`w-full text-left p-3.5 rounded-2xl transition-all border flex items-center justify-between backdrop-blur-xl active:scale-[0.98] ${
                isSelected
                  ? `${activeBg} ${borderColor} shadow-lg ring-1 ring-white/20`
                  : 'bg-[#111622]/80 border-white/10 hover:border-white/20 hover:bg-[#161c2a]/90'
              }`}
            >
              {/* Icono y Detalles */}
              <div className="flex items-center space-x-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform ${
                  isSelected
                    ? 'bg-white/15 text-white scale-105 shadow-inner'
                    : 'bg-white/5 text-slate-400'
                }`}>
                  <IconComponent className="w-6 h-6 stroke-[2.2]" />
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-white text-sm">{config.name}</span>
                    {badge && (
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        type === VEHICLE_TYPES.MOTO
                          ? 'bg-pixel-yellow/20 text-pixel-yellowLight border border-pixel-yellowLight/30'
                          : type === VEHICLE_TYPES.CARRO_CONFORT
                          ? 'bg-pixel-green/20 text-pixel-greenLight border border-pixel-greenLight/30'
                          : 'bg-pixel-blue/20 text-pixel-blueLight border border-pixel-blueLight/30'
                      }`}>
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
              <div className="text-right pl-2">
                <div className="text-base font-black text-white tracking-tight">
                  {formatUsd(fare.fareUsd)}
                </div>
                <div className="text-xs font-extrabold text-pixel-greenLight">
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
