import React, { useState } from 'react';
import { X, CheckCircle, Share2, Copy, Download, QrCode } from 'lucide-react';
import { formatUsd, formatBs, formatDistance } from '../utils/formatters.js';

export function ReceiptModal({ isOpen, onClose, ride }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !ride) return null;

  const handleCopy = () => {
    const text = `Comprobante RideX Venezuela #${ride.id}\nFecha: ${new Date(ride.createdAt || Date.now()).toLocaleString('es-VE')}\nRuta: ${ride.pickup?.name} -> ${ride.dropoff?.name}\nTotal: ${formatUsd(ride.fareUsd)} (${formatBs(ride.fareBs)})\nPago: ${ride.payment?.method || 'Pago Móvil'} - Ref: ${ride.payment?.reference || 'Confirmado'}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-cardBg border border-borderCol p-5 shadow-2xl space-y-4">
        {/* Cabecera del Recibo */}
        <div className="flex items-center justify-between pb-3 border-b border-borderCol/60">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-accentGreen text-black font-black flex items-center justify-center text-sm">
              R
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">Comprobante Digital</h3>
              <span className="text-[10px] text-slate-400 block -mt-0.5">RideX Venezuela • #{ride.id}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-surfaceBg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo del Recibo */}
        <div className="p-4 rounded-2xl bg-surfaceBg/70 border border-borderCol/70 space-y-3 text-xs">
          {/* Estado Aprobado */}
          <div className="flex items-center justify-center space-x-1.5 text-accentGreen font-bold py-1 bg-accentGreen/10 rounded-xl border border-accentGreen/20">
            <CheckCircle className="w-4 h-4" />
            <span>Transacción Liquidada con Éxito</span>
          </div>

          {/* Fecha y Conductor */}
          <div className="space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Fecha y hora:</span>
              <span className="font-medium text-white">
                {new Date(ride.createdAt || Date.now()).toLocaleString('es-VE')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Conductor:</span>
              <span className="font-medium text-white">{ride.driver?.name || 'Alejandro Colmenares'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Vehículo / Placa:</span>
              <span className="font-mono text-white">{ride.driver?.model || 'Bera 150'} • {ride.driver?.plate || 'AC881ZZ'}</span>
            </div>
          </div>

          {/* Trayecto */}
          <div className="pt-2 border-t border-borderCol/60 space-y-1">
            <div className="text-[11px] text-slate-400">
              Origen: <span className="text-white font-medium">{ride.pickup?.name}</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Destino: <span className="text-white font-medium">{ride.dropoff?.name}</span>
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between pt-0.5">
              <span>Distancia recorrida: {formatDistance(ride.distanceKm || 3.4)}</span>
              <span>Tasa BCV: Bs. {ride.bcvRate?.toFixed(2) || '54.20'}</span>
            </div>
          </div>

          {/* Desglose de Pago */}
          <div className="pt-2 border-t border-dashed border-borderCol space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Método de pago:</span>
              <span className="font-semibold text-white">
                {ride.payment?.method === 'pago_movil' ? 'Pago Móvil Interbancario' : 'Efectivo Divisas (USD)'}
              </span>
            </div>
            {ride.payment?.reference && (
              <div className="flex justify-between text-slate-400">
                <span>N° Referencia:</span>
                <span className="font-mono font-bold text-accentGreen">{ride.payment.reference}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2 border-t border-borderCol text-sm font-black text-white">
              <span>Total Pagado:</span>
              <div className="text-right">
                <span className="text-base text-white">{formatUsd(ride.fareUsd)}</span>
                <span className="block text-xs font-bold text-accentGreen">{formatBs(ride.fareBs)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex space-x-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 rounded-xl bg-surfaceBg hover:bg-surfaceBg/80 border border-borderCol text-xs font-bold text-slate-200 flex items-center justify-center space-x-1.5 transition active:scale-95"
          >
            <Copy className="w-3.5 h-3.5 text-accentYellow" />
            <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-accentGreen hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg transition active:scale-95"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
