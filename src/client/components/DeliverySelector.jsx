import React from 'react';
import {
  Bike,
  Car,
  Truck,
  Package,
  FileText,
  Utensils,
  ShoppingBag,
  Smartphone,
  Wrench,
  AlertTriangle,
  KeyRound,
  RefreshCw,
  User,
  Phone,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { VEHICLE_TYPES, VEHICLE_CONFIGS, DELIVERY_CATEGORIES } from '../../shared/constants.js';
import { calculateFare } from '../utils/pricing.js';
import { formatUsd, formatBs } from '../utils/formatters.js';
import { triggerHaptic } from '../utils/soundEffects.js';

const CATEGORY_ICONS = {
  FileText,
  Utensils,
  ShoppingBag,
  Smartphone,
  Wrench,
  AlertTriangle
};

export function DeliverySelector({
  selectedType = VEHICLE_TYPES.DELIVERY_MOTO,
  onSelectType,
  packageCategory = 'parcel',
  onSelectCategory,
  receiverName = '',
  onChangeReceiverName,
  receiverPhone = '',
  onChangeReceiverPhone,
  deliveryNotes = '',
  onChangeDeliveryNotes,
  deliveryPin = '5821',
  onRegeneratePin,
  distanceKm = 0,
  bcvRate = 880,
  isVip = false,
  onOpenVipModal
}) {
  const deliveryVehicles = [
    {
      type: VEHICLE_TYPES.DELIVERY_MOTO,
      config: VEHICLE_CONFIGS[VEHICLE_TYPES.DELIVERY_MOTO],
      icon: Bike,
      badge: '⚡ Flash • 10kg',
      tagColor: 'bg-[#FFB800]/15 text-[#FFB800] border-[#FFB800]/30',
      activeBorder: 'border-[#FFB800]',
      activeBg: 'bg-gradient-to-r from-[#FFB800]/15 to-transparent',
      glow: 'shadow-[0_0_20px_rgba(255,184,0,0.2)]'
    },
    {
      type: VEHICLE_TYPES.DELIVERY_CARRO,
      config: VEHICLE_CONFIGS[VEHICLE_TYPES.DELIVERY_CARRO],
      icon: Car,
      badge: '📦 Cajas • 50kg',
      tagColor: 'bg-[#00D2FF]/15 text-[#00D2FF] border-[#00D2FF]/30',
      activeBorder: 'border-[#00D2FF]',
      activeBg: 'bg-gradient-to-r from-[#00D2FF]/15 to-transparent',
      glow: 'shadow-[0_0_20px_rgba(0,210,255,0.2)]'
    },
    {
      type: VEHICLE_TYPES.DELIVERY_CARGA,
      config: VEHICLE_CONFIGS[VEHICLE_TYPES.DELIVERY_CARGA],
      icon: Truck,
      badge: '🛻 Carga • 200kg',
      tagColor: 'bg-[#00E599]/15 text-[#00E599] border-[#00E599]/30',
      activeBorder: 'border-[#00E599]',
      activeBg: 'bg-gradient-to-r from-[#00E599]/15 to-transparent',
      glow: 'shadow-[0_0_20px_rgba(0,229,153,0.2)]'
    }
  ];

  return (
    <div className="space-y-3.5 select-none animate-fade-in">
      {/* 1. Categoría del Paquete / Encomienda */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <Package className="w-3.5 h-3.5 text-[#00E599]" />
            <span>¿Qué estás enviando?</span>
          </span>
          <span className="text-[10px] text-slate-400">Protección RideX</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {DELIVERY_CATEGORIES.map((cat) => {
            const IconComp = CATEGORY_ICONS[cat.icon] || Package;
            const isSelected = packageCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  triggerHaptic(30);
                  onSelectCategory(cat.id);
                }}
                className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1 active:scale-95 ${
                  isSelected
                    ? 'bg-[#141A26] border-[#00E599] text-white shadow-[0_0_12px_rgba(0,229,153,0.25)]'
                    : 'bg-[#06080D]/80 border-white/[0.08] text-slate-400 hover:border-white/20'
                }`}
              >
                <IconComp className={`w-4 h-4 ${isSelected ? 'text-[#00E599]' : 'text-slate-400'}`} />
                <span className="text-[10px] font-bold leading-tight truncate w-full">{cat.label.split('/')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Datos del Destinatario y PIN de Seguridad */}
      <div className="bg-[#06080D]/90 backdrop-blur-xl p-3 rounded-2xl border border-white/[0.08] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Datos de Entrega
          </span>
          {/* PIN de entrega para verificación física */}
          <div className="flex items-center space-x-1.5 bg-[#141A26] px-2 py-0.5 rounded-lg border border-white/10">
            <KeyRound className="w-3 h-3 text-[#00E599]" />
            <span className="text-[10px] text-slate-400 font-medium">PIN Entrega:</span>
            <strong className="text-xs font-black tracking-widest text-white">{deliveryPin}</strong>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRegeneratePin();
                triggerHaptic(50);
              }}
              title="Generar nuevo PIN"
              className="p-0.5 hover:text-[#00E599] text-slate-400 transition"
            >
              <RefreshCw className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Nombre receptor */}
          <div className="relative">
            <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={receiverName}
              onChange={(e) => onChangeReceiverName(e.target.value)}
              placeholder="Nombre de quien recibe"
              className="w-full pl-8 pr-2 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E599]"
            />
          </div>

          {/* Teléfono receptor */}
          <div className="relative">
            <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              value={receiverPhone}
              onChange={(e) => onChangeReceiverPhone(e.target.value)}
              placeholder="0414-0000000"
              className="w-full pl-8 pr-2 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E599]"
            />
          </div>
        </div>

        {/* Instrucciones adicionales */}
        <input
          type="text"
          value={deliveryNotes}
          onChange={(e) => onChangeDeliveryNotes(e.target.value)}
          placeholder="Instrucciones: Casa blanca con rejas negras, timbre 4..."
          className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E599]"
        />
      </div>

      {/* 3. Selección de Vehículo / Capacidad de Encomienda */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            Vehículo de Entrega
          </span>
          <span className="text-[10px] text-slate-400">
            Tasa: <strong className="text-[#00E599] font-black">Bs. {typeof bcvRate === 'number' ? bcvRate.toFixed(2) : bcvRate}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {deliveryVehicles.map(({ type, config, icon: IconComponent, badge, tagColor, activeBorder, activeBg, glow }) => {
            const fare = calculateFare({
              distanceKm,
              vehicleType: type,
              bcvRate,
              isVip
            });
            const isSelected = selectedType === type;

            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  triggerHaptic(40);
                  onSelectType(type);
                }}
                className={`w-full text-left p-3 rounded-2xl transition-all duration-200 border flex items-center justify-between backdrop-blur-xl relative overflow-hidden active:scale-[0.98] ${
                  isSelected
                    ? `${activeBg} ${activeBorder} ${glow} ring-1 ring-white/20 bg-[#0E1420]`
                    : 'bg-[#0D111A]/90 border-white/[0.08] hover:border-white/20 hover:bg-[#141A26]'
                }`}
              >
                {/* Indicador de selección lateral */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#00E599] to-[#00D2FF]" />
                )}

                {/* Icono e Info */}
                <div className="flex items-center space-x-3 pl-1">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform ${
                      isSelected
                        ? 'bg-white/10 text-white scale-105 shadow-inner border border-white/10'
                        : 'bg-white/[0.04] text-slate-400 border border-white/[0.04]'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 stroke-[2.2]" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-white text-xs">{config.name}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${tagColor}`}>
                        {badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      {config.subtitle}
                    </p>
                  </div>
                </div>

                {/* Precio y Ahorro VIP */}
                <div className="text-right flex-shrink-0 pl-2">
                  {fare.isVip && fare.savingsUsd > 0 ? (
                    <div>
                      <div className="flex items-center justify-end space-x-1">
                        <span className="text-[10px] text-slate-500 line-through">
                          {formatUsd(fare.regularFareUsd)}
                        </span>
                        <span className="font-black text-sm text-[#00E599]">
                          {formatUsd(fare.fareUsd)}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        {formatBs(fare.fareBs)}
                      </span>
                      <span className="text-[9px] font-bold text-amber-300 block">
                        VIP 15% OFF
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="font-black text-sm text-white block">
                        {formatUsd(fare.fareUsd)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        {formatBs(fare.fareBs)}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Banner de Ahorro VIP si no es miembro */}
      {!isVip && (
        <div
          onClick={onOpenVipModal}
          className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-[#141A26] to-[#0D111A] border border-amber-500/30 flex items-center justify-between cursor-pointer hover:border-amber-400 transition"
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="text-[11px] text-slate-300 font-medium">
              Ahorra <strong className="text-amber-300 font-black">15%</strong> en este envío con <strong className="text-white">RideX Pass</strong>
            </span>
          </div>
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider pl-1">
            Ver &gt;
          </span>
        </div>
      )}
    </div>
  );
}
