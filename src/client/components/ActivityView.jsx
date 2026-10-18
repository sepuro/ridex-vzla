import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Bike,
  Car,
  Sparkles,
  CheckCircle,
  Smartphone,
  Banknote,
  FileText,
  ChevronRight,
  RotateCcw,
  Navigation,
  Compass,
  DollarSign,
  TrendingUp,
  ChevronDown,
  Package,
  Truck,
  KeyRound
} from 'lucide-react';
import { formatUsd, formatBs, formatDistance } from '../utils/formatters.js';
import { triggerHaptic } from '../utils/soundEffects.js';

export function ActivityView({ activeRide, onSelectRideForReceipt, onReorderRide }) {
  const [filter, setFilter] = useState('todos');
  const [expandedRideId, setExpandedRideId] = useState(null);

  // Historial de viajes con datos representativos venezolanos
  const sampleHistory = [
    {
      id: 'RX-1049',
      date: 'Hoy, 02:45 PM',
      pickup: { name: 'Farmatodo La Castellana, Caracas', lat: 10.4990, lng: -66.8520 },
      dropoff: { name: 'Residencias Los Pinos, Chacao', lat: 10.4920, lng: -66.8580 },
      serviceMode: 'delivery',
      vehicleType: 'delivery_moto',
      vehicleName: 'Moto Flash Encomienda',
      driverName: 'Carlos Mendoza',
      fareUsd: 2.10,
      fareBs: 1848.25,
      distanceKm: 2.1,
      status: 'PAID',
      packageDetails: {
        category: 'parcel',
        receiverName: 'Valeria Benítez',
        receiverPhone: '0424-5551234',
        deliveryPin: '4912'
      },
      payment: { method: 'pago_movil', reference: '381920', bank: 'Banesco' },
      rating: 5
    },
    {
      id: 'RX-1042',
      date: 'Hoy, 10:15 AM',
      pickup: { name: 'Plaza Venezuela, Sabana Grande, Caracas', lat: 10.4955, lng: -66.8835 },
      dropoff: { name: 'Centro Comercial CCCT, Chuao, Caracas', lat: 10.4851, lng: -66.8522 },
      serviceMode: 'rides',
      vehicleType: 'moto',
      vehicleName: 'Moto Express',
      driverName: 'Alejandro Colmenares',
      fareUsd: 2.80,
      fareBs: 2464.34,
      distanceKm: 3.8,
      status: 'PAID',
      payment: { method: 'pago_movil', reference: '918234', bank: 'Banco de Venezuela' },
      rating: 5
    },
    {
      id: 'RX-1038',
      date: 'Ayer, 06:40 PM',
      pickup: { name: 'Plaza Francia, Altamira, Chacao', lat: 10.4984, lng: -66.8505 },
      dropoff: { name: 'Calle París, Las Mercedes, Baruta', lat: 10.4789, lng: -66.8643 },
      serviceMode: 'rides',
      vehicleType: 'carro_standard',
      vehicleName: 'Carro Estándar',
      driverName: 'Franklin Rivas',
      fareUsd: 4.50,
      fareBs: 3960.54,
      distanceKm: 4.2,
      status: 'PAID',
      payment: { method: 'efectivo_usd', billReceivedUsd: 10, changeUsd: 5.50 },
      rating: 5
    },
    {
      id: 'RX-1025',
      date: '15 Octubre, 02:10 PM',
      pickup: { name: 'Parroquia La Candelaria, Caracas', lat: 10.5052, lng: -66.9015 },
      dropoff: { name: 'Terminal La Bandera, El Valle', lat: 10.4746, lng: -66.9112 },
      serviceMode: 'rides',
      vehicleType: 'carro_confort',
      vehicleName: 'Carro Confort (A/C)',
      driverName: 'Marcos Villegas',
      fareUsd: 6.00,
      fareBs: 5280.72,
      distanceKm: 5.9,
      status: 'PAID',
      payment: { method: 'pago_movil', reference: '774412', bank: 'Banesco' },
      rating: 5
    }
  ];

  const allRides = activeRide ? [activeRide, ...sampleHistory] : sampleHistory;

  // Métricas acumuladas
  const totalSpentUsd = allRides.reduce((sum, r) => sum + (Number(r.fareUsd) || 0), 0);
  const totalKm = allRides.reduce((sum, r) => sum + (Number(r.distanceKm) || 0), 0);

  const filteredRides = allRides.filter((r) => {
    if (filter === 'todos') return true;
    if (filter === 'viajes') return r.serviceMode !== 'delivery';
    if (filter === 'delivery') return r.serviceMode === 'delivery';
    if (filter === 'pago_movil') return r.payment?.method === 'pago_movil';
    if (filter === 'efectivo') return r.payment?.method === 'efectivo_usd';
    return true;
  });

  const toggleExpand = (id) => {
    triggerHaptic(20);
    setExpandedRideId(expandedRideId === id ? null : id);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-16 text-slate-100 select-none">
      {/* 1. Header con Resumen de Métricas de Viaje */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-[#0D111A] via-[#121824] to-[#0A0E17] border border-white/[0.08] shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-white tracking-tight flex items-center space-x-1.5">
              <span>Tu Actividad de Movilidad</span>
              <Sparkles className="w-4 h-4 text-[#00E599]" />
            </h2>
            <p className="text-[11px] text-slate-400">Historial de viajes y envíos con respaldo BCV</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#00E599]/15 border border-[#00E599]/30 text-[11px] font-black text-[#00E599]">
            {allRides.length} órdenes
          </span>
        </div>

        {/* 3 Widgets minimalistas de métricas */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/[0.08]">
          <div className="p-2.5 rounded-2xl bg-black/40 border border-white/[0.04] text-center">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Inversión</span>
            <span className="text-sm font-black text-white">{formatUsd(totalSpentUsd)}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-black/40 border border-white/[0.04] text-center">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Recorridos</span>
            <span className="text-sm font-black text-[#00E599]">{totalKm.toFixed(1)} km</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-black/40 border border-white/[0.04] text-center">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Ahorro Prom.</span>
            <span className="text-sm font-black text-[#FFB800]">18%</span>
          </div>
        </div>
      </div>

      {/* 2. Filtros estilo Chip Píldora */}
      <div className="flex space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'todos', label: 'Todos' },
          { id: 'viajes', label: '🚗 Viajes' },
          { id: 'delivery', label: '📦 Envíos' },
          { id: 'pago_movil', label: 'Pago Móvil' },
          { id: 'efectivo', label: 'Efectivo USD' }
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => {
              triggerHaptic(25);
              setFilter(id);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black transition border whitespace-nowrap active:scale-95 ${
              filter === id
                ? 'bg-[#00E599] text-black border-[#00E599] shadow-md shadow-[#00E599]/20'
                : 'bg-[#0D111A] border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 3. Lista de Viajes */}
      <div className="space-y-3">
        {filteredRides.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-[#0D111A] border border-white/[0.08] space-y-2">
            <Clock className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400 font-medium">No se encontraron viajes con este filtro.</p>
          </div>
        ) : (
          filteredRides.map((ride) => {
            const isDelivery = ride.serviceMode === 'delivery' || ride.vehicleType?.startsWith('delivery_');
            const isMoto = ride.vehicleType === 'moto' || ride.vehicleType === 'delivery_moto';
            const isTruck = ride.vehicleType === 'delivery_carga';
            const isPagoMovil = ride.payment?.method === 'pago_movil';
            const isExpanded = expandedRideId === ride.id;

            return (
              <div
                key={ride.id}
                className="rounded-3xl bg-[#0D111A]/95 border border-white/[0.08] shadow-lg hover:border-white/20 transition-all overflow-hidden"
              >
                {/* Cabecera del Viaje */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                        isDelivery
                          ? 'bg-[#00D2FF]/15 text-[#00D2FF] border border-[#00D2FF]/30'
                          : isMoto
                            ? 'bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30'
                            : 'bg-[#00E599]/15 text-[#00E599] border border-[#00E599]/30'
                      }`}>
                        {isDelivery ? (
                          isTruck ? <Truck className="w-5 h-5" /> : <Package className="w-5 h-5" />
                        ) : isMoto ? (
                          <Bike className="w-5 h-5" />
                        ) : (
                          <Car className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h4 className="font-black text-white text-xs">{ride.vehicleName || (isDelivery ? 'Moto Flash Encomienda' : 'Moto Express')}</h4>
                          {isDelivery && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-[#00D2FF]/20 text-[#00D2FF] border border-[#00D2FF]/30">
                              Envío
                            </span>
                          )}
                          <span className="text-[10px] text-[#FFB800] font-bold">★ {ride.rating || 5}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {ride.date || 'Reciente'} • #{ride.id}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-white text-sm block">{formatUsd(ride.fareUsd)}</span>
                      <span className="text-[11px] font-black text-[#00E599] block">{formatBs(ride.fareBs)}</span>
                    </div>
                  </div>

                  {/* Paquete / Destinatario si es Delivery */}
                  {ride.packageDetails && (
                    <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-[11px]">
                      <div className="flex items-center space-x-1.5">
                        <Package className="w-3.5 h-3.5 text-[#00D2FF] flex-shrink-0" />
                        <span className="text-slate-300 truncate">
                          Para: <strong className="text-white">{ride.packageDetails.receiverName || 'Destinatario'}</strong>
                        </span>
                      </div>
                      {ride.packageDetails.deliveryPin && (
                        <span className="flex items-center space-x-1 font-mono font-black text-[#00E599] bg-[#00E599]/10 px-2 py-0.5 rounded-lg border border-[#00E599]/20 flex-shrink-0">
                          <KeyRound className="w-3 h-3" />
                          <span>PIN: {ride.packageDetails.deliveryPin}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Trayecto visual con conector estilo Uber / Google Maps */}
                  <div className="space-y-2 text-xs relative pl-4 border-l-2 border-dashed border-white/20 ml-2.5 my-1">
                    <div className="relative">
                      <span className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-[#00E599] ring-4 ring-black/60" />
                      <p className="text-[10px] text-slate-400 font-bold leading-tight">ORIGEN</p>
                      <p className="text-xs text-slate-200 font-medium truncate">{ride.pickup?.name || 'Origen fijado'}</p>
                    </div>

                    <div className="relative pt-1">
                      <span className="absolute -left-[23px] top-2 w-2.5 h-2.5 rounded-full bg-[#FF3B5C] ring-4 ring-black/60" />
                      <p className="text-[10px] text-slate-400 font-bold leading-tight">DESTINO</p>
                      <p className="text-xs text-slate-200 font-medium truncate">{ride.dropoff?.name || 'Destino fijado'}</p>
                    </div>
                  </div>

                  {/* Barra de Conductor y Método de Pago */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-300">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-slate-400">Conductor:</span>
                      <span className="font-bold text-white truncate max-w-[120px]">{ride.driverName || ride.driver?.name || 'Alejandro C.'}</span>
                    </div>

                    <div className="flex items-center space-x-1 font-semibold text-slate-300">
                      {isPagoMovil ? (
                        <>
                          <Smartphone className="w-3.5 h-3.5 text-[#00E599]" />
                          <span>Pago Móvil</span>
                        </>
                      ) : (
                        <>
                          <Banknote className="w-3.5 h-3.5 text-[#FFB800]" />
                          <span>Efectivo USD</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Acciones principales: "Pedir de nuevo" & "Ver Recibo" */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.08]">
                    {/* Botón 1: Pedir de nuevo (Re-order) */}
                    <button
                      onClick={() => onReorderRide && onReorderRide(ride)}
                      className="py-2.5 px-3 rounded-2xl bg-[#00D2FF]/15 hover:bg-[#00D2FF]/25 border border-[#00D2FF]/30 text-[#00D2FF] text-xs font-black flex items-center justify-center space-x-1.5 active:scale-95 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Pedir de nuevo</span>
                    </button>

                    {/* Botón 2: Ver Recibo */}
                    <button
                      onClick={() => onSelectRideForReceipt(ride)}
                      className="py-2.5 px-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white text-xs font-black flex items-center justify-center space-x-1.5 active:scale-95 transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#00E599]" />
                      <span>Ver Recibo</span>
                    </button>
                  </div>
                </div>

                {/* Detalle Desplegable opcional */}
                <div
                  onClick={() => toggleExpand(ride.id)}
                  className="px-4 py-2 bg-black/40 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-slate-400 font-semibold cursor-pointer hover:text-white transition"
                >
                  <span>Detalles de pago y referencia</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>

                {isExpanded && (
                  <div className="p-3 bg-black/60 border-t border-white/[0.04] text-[11px] space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Distancia calculada:</span>
                      <span className="font-mono font-bold text-white">{formatDistance(ride.distanceKm || 3.5)}</span>
                    </div>
                    {ride.payment?.bank && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Banco receptor:</span>
                        <span className="font-medium text-white">{ride.payment.bank}</span>
                      </div>
                    )}
                    {ride.payment?.reference && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Referencia:</span>
                        <span className="font-mono font-bold text-[#00E599]">{ride.payment.reference}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
