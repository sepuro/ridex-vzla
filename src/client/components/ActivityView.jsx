import React, { useState } from 'react';
import { Clock, MapPin, Bike, Car, Sparkles, CheckCircle, Smartphone, Banknote, FileText, ChevronRight } from 'lucide-react';
import { formatUsd, formatBs, formatDistance } from '../utils/formatters.js';

export function ActivityView({ activeRide, onSelectRideForReceipt }) {
  const [filter, setFilter] = useState('todos');

  // Historial de viajes con datos representativos venezolanos
  const sampleHistory = [
    {
      id: 'RX-1042',
      date: 'Hoy, 10:15 AM',
      pickup: { name: 'Plaza Venezuela, Caracas' },
      dropoff: { name: 'Centro Comercial CCCT, Chuao' },
      vehicleType: 'moto',
      vehicleName: 'Moto Express',
      driverName: 'Alejandro Colmenares',
      fareUsd: 2.80,
      fareBs: 151.76,
      distanceKm: 3.8,
      status: 'PAID',
      payment: { method: 'pago_movil', reference: '918234', bank: 'Banco de Venezuela' },
      rating: 5
    },
    {
      id: 'RX-1038',
      date: 'Ayer, 06:40 PM',
      pickup: { name: 'Plaza Altamira, Chacao' },
      dropoff: { name: 'Las Mercedes (Calle París)' },
      vehicleType: 'carro_standard',
      vehicleName: 'Carro Estándar',
      driverName: 'Franklin Rivas',
      fareUsd: 4.50,
      fareBs: 243.90,
      distanceKm: 4.2,
      status: 'PAID',
      payment: { method: 'efectivo_usd', billReceivedUsd: 10, changeUsd: 5.50 },
      rating: 5
    },
    {
      id: 'RX-1025',
      date: '15 Octubre, 02:10 PM',
      pickup: { name: 'La Candelaria, Caracas' },
      dropoff: { name: 'Terminal La Bandera' },
      vehicleType: 'carro_confort',
      vehicleName: 'Carro Confort (A/C)',
      driverName: 'Marcos Villegas',
      fareUsd: 6.00,
      fareBs: 325.20,
      distanceKm: 5.9,
      status: 'PAID',
      payment: { method: 'pago_movil', reference: '774412', bank: 'Banesco' },
      rating: 5
    }
  ];

  const allRides = activeRide ? [activeRide, ...sampleHistory] : sampleHistory;

  const filteredRides = allRides.filter((r) => {
    if (filter === 'todos') return true;
    if (filter === 'pago_movil') return r.payment?.method === 'pago_movil';
    if (filter === 'efectivo') return r.payment?.method === 'efectivo_usd';
    return true;
  });

  return (
    <div className="space-y-4 animate-fade-in pb-16">
      {/* Título y Filtros */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white tracking-tight">Actividad y Viajes</h2>
          <span className="text-xs text-accentGreen font-bold">{allRides.length} registrados</span>
        </div>

        {/* Chips de Filtro */}
        <div className="flex space-x-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'pago_movil', label: 'Pago Móvil' },
            { id: 'efectivo', label: 'Efectivo USD' }
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition border ${
                filter === id
                  ? 'bg-accentGreen text-black border-accentGreen shadow-sm shadow-accentGreen/20'
                  : 'bg-surfaceBg/70 border-borderCol text-slate-300 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Viajes */}
      <div className="space-y-3">
        {filteredRides.map((ride) => {
          const isMoto = ride.vehicleType === 'moto';
          const isPagoMovil = ride.payment?.method === 'pago_movil';

          return (
            <div
              key={ride.id}
              className="p-4 rounded-3xl bg-cardBg border border-borderCol shadow-xl space-y-3 hover:border-borderCol/80 transition"
            >
              {/* Cabecera del Item */}
              <div className="flex items-center justify-between pb-2 border-b border-borderCol/60">
                <div className="flex items-center space-x-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isMoto ? 'bg-accentYellow/15 text-accentYellow' : 'bg-accentGreen/15 text-accentGreen'
                  }`}>
                    {isMoto ? <Bike className="w-5 h-5" /> : <Car className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs">{ride.vehicleName || 'Moto Express'}</h4>
                    <span className="text-[10px] text-slate-400 block">{ride.date || 'Reciente'} • #{ride.id}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-white text-sm block">{formatUsd(ride.fareUsd)}</span>
                  <span className="text-[11px] font-bold text-accentGreen block">{formatBs(ride.fareBs)}</span>
                </div>
              </div>

              {/* Ruta */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-accentGreen flex-shrink-0" />
                  <span className="text-slate-300 truncate">{ride.pickup?.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-accentYellow flex-shrink-0" />
                  <span className="text-slate-300 truncate">{ride.dropoff?.name}</span>
                </div>
              </div>

              {/* Método de Pago y Botón de Recibo */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-1.5 text-[11px] font-medium text-slate-300">
                  {isPagoMovil ? (
                    <>
                      <Smartphone className="w-3.5 h-3.5 text-accentGreen" />
                      <span>Pago Móvil {ride.payment?.reference ? `(Ref: ${ride.payment.reference})` : ''}</span>
                    </>
                  ) : (
                    <>
                      <Banknote className="w-3.5 h-3.5 text-accentYellow" />
                      <span>Efectivo Divisas</span>
                    </>
                  )}
                </div>

                <button
                  onClick={() => onSelectRideForReceipt(ride)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-surfaceBg hover:bg-surfaceBg/80 border border-borderCol text-[11px] font-bold text-slate-200 transition active:scale-95"
                >
                  <FileText className="w-3.5 h-3.5 text-accentGreen" />
                  <span>Ver Recibo</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
