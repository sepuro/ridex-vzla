import React from 'react';
import { Bike, Car, Sparkles, Clock, Check } from 'lucide-react';
import { VEHICLE_TYPES, VEHICLE_CONFIGS } from '../../shared/constants.js';
import { calculateFare } from '../utils/pricing.js';
import { formatUsd, formatBs } from '../utils/formatters.js';

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
      badge: 'Más Rápido'
    },
    {
      type: VEHICLE_TYPES.CARRO_STANDARD,
      config: VEHICLE_CONFIGS[VEHICLE_TYPES.CARRO_STANDARD],
      icon: Car,
      badge: 'Popular'
    },
    {
      type: VEHICLE_TYPES.CARRO_CONFORT,
      config: VEHICLE_CONFIGS[VEHICLE_TYPES.CARRO_CONFORT],
      icon: Sparkles,
      badge: 'Con A/C'
    }
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Selecciona tu categoría</h4>
        <span className="text-[11px] text-accentGreen font-semibold">Tasa: Bs. {bcvRate.toFixed(2)}</span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {vehicles.map(({ type, config, icon: IconComponent, badge }) => {
          const fare = calculateFare({ distanceKm, vehicleType: type, bcvRate });
          const isSelected = selectedType === type;

          return (
            <button
              key={type}
              onClick={() => onSelectType(type)}
              className={`w-full text-left p-3 rounded-2xl transition-all border flex items-center justify-between ${
                isSelected
                  ? 'bg-surfaceBg/90 border-accentGreen shadow-lg shadow-accentGreen/10 ring-1 ring-accentGreen/40'
                  : 'bg-cardBg/80 border-borderCol/70 hover:border-borderCol hover:bg-surfaceBg/40'
              }`}
            >
              {/* Icono y Detalles */}
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isSelected ? 'bg-accentGreen/20 text-accentGreen' : 'bg-surfaceBg text-slate-300'
                }`}>
                  <IconComponent className="w-6 h-6" />
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">{config.name}</span>
                    {badge && (
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                        type === VEHICLE_TYPES.MOTO 
                          ? 'bg-accentYellow/20 text-accentYellow border border-accentYellow/30' 
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{config.subtitle}</p>
                  <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-slate-400 font-medium">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-0.5 text-slate-400" />
                      {fare.estimatedMinutes} min
                    </span>
                    <span>•</span>
                    <span>Cap: {config.capacity} {config.capacity === 1 ? 'persona' : 'personas'}</span>
                  </div>
                </div>
              </div>

              {/* Precios en USD y Bs */}
              <div className="text-right pl-2">
                <div className="text-base font-extrabold text-white tracking-tight">
                  {formatUsd(fare.fareUsd)}
                </div>
                <div className="text-xs font-bold text-accentGreen">
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
