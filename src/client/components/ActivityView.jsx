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
  ChevronDown
} from 'lucide-react';
import { formatUsd, formatBs, formatDistance } from '../utils/formatters.js';

export function ActivityView({ activeRide, onSelectRideForReceipt, onReorderRide }) {
  const [filter, setFilter] = useState('todos');
  const [expandedRideId, setExpandedRideId] = useState(null);

  // Historial de viajes con datos representativos venezolanos
  const sampleHistory = [
    {
      id: 'RX-1042',
      date: 'Hoy, 10:15 AM',
      pickup: { name: 'Plaza Venezuela, Sabana Grande, Caracas', lat: 10.4955, lng: -66.8835 },
      dropoff: { name: 'Centro Comercial CCCT, Chuao, Caracas', lat: 10.4851, lng: -66.8522 },
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
    if (filter === 'pago_movil') return r.payment?.method === 'pago_movil';
    if (filter === 'efectivo') return r.payment?.method === 'efectivo_usd';
    return true;
  });

  const toggleExpand = (id) => {
    setExpandedRideId(expandedRideId === id ? null : id);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-16 text-slate-100">
      {/* 1. Header con Resumen de Métricas de Viaje (Estilo Pixel / iOS Dashboard) */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-[#121722] to-[#1a2133] border border-white/10 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-white tracking-tight flex items-center space-x-1.5">
              <span>Tu Actividad de Movilidad</span>
              <Sparkles className="w-4 h-4 text-pixel-green" />
            </h2>
            <p className="text-[11px] text-slate-400">Historial completo con respaldo BCV y comprobantes</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-pixel-green/20 border border-pixel-green/30 text-[11px] font-black text-pixel-greenLight">
            {allRides.length} viajes
          </span>
        </div>

        {/* 3 Widgets minimalistas de métricas */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/10">
          <div className="p-2.5 rounded-2xl bg-black/30 border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Inversión</span>
            <span className="text-sm font-black text-white">{formatUsd(totalSpentUsd)}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-black/30 border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Recorridos</span>
            <span className="text-sm font-black text-pixel-greenLight">{totalKm.toFixed(1)} km</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-black/30 border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Ahorro Prom.</span>
            <span className="text-sm font-black text-pixel-yellow">18%</span>
          </div>
        </div>
      </div>

      {/* 2. Filtros estilo Chip Píldora Material You */}
      <div className="flex space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'todos', label: 'Todos los viajes' },
          { id: 'pago_movil', label: 'Pago Móvil' },
          { id: 'efectivo', label: 'Efectivo USD' }
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition border whitespace-nowrap ${
              filter === id
                ? 'bg-pixel-green text-black border-pixel-green shadow-sm shadow-pixel-green/30'
                : 'bg-[#121622]/80 border-white/10 text-slate-300 hover:text-white hover:bg-[#1a2133]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 3. Lista de Viajes */}
      <div className="space-y-3">
        {filteredRides.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-[#121622]/70 border border-white/10 space-y-2">
            <Clock className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400 font-medium">No se encontraron viajes con este filtro.</p>
          </div>
        ) : (
          filteredRides.map((ride) => {
            const isMoto = ride.vehicleType === 'moto';
            const isPagoMovil = ride.payment?.method === 'pago_movil';
            const isExpanded = expandedRideId === ride.id;

            return (
              <div
                key={ride.id}
                className="rounded-3xl bg-[#121622]/90 border border-white/10 shadow-lg hover:border-white/20 transition-all overflow-hidden"
              >
                {/* Cabecera del Viaje */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                        isMoto
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-pixel-green/15 text-pixel-green border border-pixel-green/30'
                      }`}>
                        {isMoto ? <Bike className="w-5 h-5" /> : <Car className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h4 className="font-extrabold text-white text-xs">{ride.vehicleName || 'Moto Express'}</h4>
                          <span className="text-[10px] text-pixel-yellow font-bold">★ {ride.rating || 5}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {ride.date || 'Reciente'} • #{ride.id}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-white text-sm block">{formatUsd(ride.fareUsd)}</span>
                      <span className="text-[11px] font-bold text-pixel-greenLight block">{formatBs(ride.fareBs)}</span>
                    </div>
                  </div>

                  {/* Trayecto visual con conector estilo Uber / Google Maps */}
                  <div className="space-y-2 text-xs relative pl-4 border-l-2 border-dashed border-white/15 ml-2.5 my-1">
                    <div className="relative">
                      <span className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-pixel-green ring-4 ring-black/40" />
                      <p className="text-[10px] text-slate-400 font-semibold leading-tight">ORIGEN</p>
                      <p className="text-xs text-slate-200 font-medium truncate">{ride.pickup?.name || 'Origen fijado'}</p>
                    </div>

                    <div className="relative pt-1">
                      <span className="absolute -left-[23px] top-2 w-2.5 h-2.5 rounded-full bg-pixel-yellow ring-4 ring-black/40" />
                      <p className="text-[10px] text-slate-400 font-semibold leading-tight">DESTINO</p>
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
                          <Smartphone className="w-3.5 h-3.5 text-pixel-green" />
                          <span>Pago Móvil</span>
                        </>
                      ) : (
                        <>
                          <Banknote className="w-3.5 h-3.5 text-pixel-yellow" />
                          <span>Efectivo USD</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Acciones principales: "Pedir de nuevo" & "Ver Recibo" */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                    {/* Botón 1: Pedir de nuevo (Re-order) */}
                    <button
                      onClick={() => onReorderRide && onReorderRide(ride)}
                      className="py-2.5 px-3 rounded-2xl bg-pixel-blue/15 hover:bg-pixel-blue/25 border border-pixel-blue/30 text-pixel-blueLight text-xs font-bold flex items-center justify-center space-x-1.5 active:scale-95 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Pedir de nuevo</span>
                    </button>

                    {/* Botón 2: Ver Recibo */}
                    <button
                      onClick={() => onSelectRideForReceipt(ride)}
                      className="py-2.5 px-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-bold flex items-center justify-center space-x-1.5 active:scale-95 transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-pixel-green" />
                      <span>Ver Recibo</span>
                    </button>
                  </div>
                </div>

                {/* Detalle Desplegable opcional */}
                <div
                  onClick={() => toggleExpand(ride.id)}
                  className="px-4 py-2 bg-black/25 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-semibold cursor-pointer hover:text-white transition"
                >
                  <span>Detalles de pago y referencia</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>

                {isExpanded && (
                  <div className="p-3 bg-black/40 border-t border-white/5 text-[11px] space-y-1 text-slate-300">
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
                        <span className="font-mono font-bold text-pixel-green">{ride.payment.reference}</span>
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
