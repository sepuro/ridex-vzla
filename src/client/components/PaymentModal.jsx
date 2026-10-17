import React, { useState } from 'react';
import { X, Smartphone, Banknote, QrCode, Copy, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { PAYMENT_METHODS } from '../../shared/constants.js';
import { VENEZUELAN_BANKS, validatePagoMovil, calculateCashChange } from '../utils/banks.js';
import { formatUsd, formatBs } from '../utils/formatters.js';

export function PaymentModal({
  isOpen,
  onClose,
  ride,
  onSubmitPayment
}) {
  if (!isOpen || !ride) return null;

  const [activeTab, setActiveTab] = useState(PAYMENT_METHODS.PAGO_MOVIL);
  const [copied, setCopied] = useState(false);

  // Formulario Pago Móvil
  const [senderBank, setSenderBank] = useState('0102');
  const [senderPhone, setSenderPhone] = useState('04121234567');
  const [senderId, setSenderId] = useState('V-24555666');
  const [reference, setReference] = useState('');
  const [pagoMovilError, setPagoMovilError] = useState('');

  // Formulario Efectivo
  const [cashBill, setCashBill] = useState(Math.ceil(ride.fareUsd / 5) * 5 || 5);

  // Datos predeterminados de cobro del conductor (o plataforma)
  const driverPaymentData = {
    bank: '0102 - Banco de Venezuela',
    phone: ride.driver?.phone || '04127654321',
    idDoc: 'V-19888777',
    holder: ride.driver?.name || 'Conductor RideX'
  };

  const handleCopyPaymentData = () => {
    const text = `Pago Móvil RideX:\nBanco: ${driverPaymentData.bank}\nTel: ${driverPaymentData.phone}\nCI: ${driverPaymentData.idDoc}\nMonto: ${formatBs(ride.fareBs)}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitPagoMovil = (e) => {
    e.preventDefault();
    setPagoMovilError('');

    const validation = validatePagoMovil({
      phone: senderPhone,
      bankCode: senderBank,
      idDoc: senderId,
      reference
    });

    if (!validation.isValid) {
      setPagoMovilError(validation.errors[0]);
      return;
    }

    onSubmitPayment({
      method: PAYMENT_METHODS.PAGO_MOVIL,
      senderBank,
      senderPhone,
      senderId,
      reference: reference.trim(),
      amountBs: ride.fareBs,
      amountUsd: ride.fareUsd,
      bcvRate: ride.bcvRate
    });

    onClose();
  };

  const handleSubmitCash = () => {
    const changeCalc = calculateCashChange({
      fareUsd: ride.fareUsd,
      billReceivedUsd: cashBill,
      bcvRate: ride.bcvRate
    });

    if (!changeCalc.isValid) {
      alert(changeCalc.message);
      return;
    }

    onSubmitPayment({
      method: PAYMENT_METHODS.EFECTIVO_USD,
      billReceivedUsd: cashBill,
      changeUsd: changeCalc.changeUsd,
      changeBs: changeCalc.changeBs,
      amountUsd: ride.fareUsd,
      bcvRate: ride.bcvRate
    });

    onClose();
  };

  const changeResult = calculateCashChange({
    fareUsd: ride.fareUsd,
    billReceivedUsd: cashBill,
    bcvRate: ride.bcvRate
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in safe-area-pb">
      <div className="w-full max-w-md rounded-t-[32px] sm:rounded-[32px] bg-[#0c101b]/95 border-t sm:border border-white/15 p-5 shadow-2xl backdrop-blur-2xl max-h-[90vh] overflow-y-auto no-scrollbar text-slate-100 space-y-4">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="font-extrabold text-white text-base">Liquidar Pago del Viaje</h3>
            <p className="text-xs text-slate-400">
              Total a pagar: <strong className="text-white">{formatUsd(ride.fareUsd)}</strong> ({formatBs(ride.fareBs)})
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pestañas de Métodos de Pago estilo Material You */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveTab(PAYMENT_METHODS.PAGO_MOVIL)}
            className={`py-2.5 px-3 rounded-2xl flex items-center justify-center space-x-1.5 text-xs font-bold transition border ${
              activeTab === PAYMENT_METHODS.PAGO_MOVIL
                ? 'bg-pixel-green text-black border-pixel-green shadow-lg shadow-pixel-green/20'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Pago Móvil</span>
          </button>

          <button
            onClick={() => setActiveTab(PAYMENT_METHODS.EFECTIVO_USD)}
            className={`py-2.5 px-3 rounded-2xl flex items-center justify-center space-x-1.5 text-xs font-bold transition border ${
              activeTab === PAYMENT_METHODS.EFECTIVO_USD
                ? 'bg-pixel-yellow text-black border-pixel-yellow shadow-lg shadow-pixel-yellow/20'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Banknote className="w-4 h-4" />
            <span>Efectivo Divisas</span>
          </button>
        </div>

        {/* 1. Vista Pago Móvil */}
        {activeTab === PAYMENT_METHODS.PAGO_MOVIL && (
          <div className="space-y-4 animate-fade-in">
            {/* Tarjeta con los datos de cobro del conductor */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="text-[11px] font-black text-pixel-greenLight uppercase tracking-wider">
                  Datos del Conductor
                </span>
                <button
                  onClick={handleCopyPaymentData}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-pixel-green/15 text-pixel-greenLight hover:bg-pixel-green/25 border border-pixel-green/30 text-[11px] font-bold transition active:scale-95"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-pixel-green" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '¡Copiado!' : 'Copiar todo'}</span>
                </button>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Banco:</span>
                  <span className="font-semibold text-white">{driverPaymentData.bank}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Teléfono:</span>
                  <span className="font-mono font-bold text-white">{driverPaymentData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cédula / RIF:</span>
                  <span className="font-mono font-bold text-white">{driverPaymentData.idDoc}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-white/10">
                  <span className="font-bold text-slate-300">Monto exacto:</span>
                  <span className="font-black text-pixel-greenLight text-sm">{formatBs(ride.fareBs)}</span>
                </div>
              </div>
            </div>

            {/* Formulario de reporte de Pago Móvil */}
            <form onSubmit={handleSubmitPagoMovil} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Tu Banco Emisor
                </label>
                <select
                  value={senderBank}
                  onChange={(e) => setSenderBank(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/15 text-xs font-medium text-white focus:outline-none focus:border-pixel-green"
                >
                  {VENEZUELAN_BANKS.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Teléfono Emisor
                  </label>
                  <input
                    type="text"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="04121234567"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-pixel-green"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Cédula / RIF
                  </label>
                  <input
                    type="text"
                    value={senderId}
                    onChange={(e) => setSenderId(e.target.value)}
                    placeholder="V-12345678"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-pixel-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Número de Referencia (4 a 8 dígitos)
                </label>
                <input
                  type="text"
                  maxLength={8}
                  value={reference}
                  onChange={(e) => setReference(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ej: 849302"
                  className="w-full p-3 rounded-xl bg-slate-900 border border-white/15 text-sm font-mono font-bold text-pixel-green text-center tracking-widest focus:outline-none focus:border-pixel-green"
                  required
                />
              </div>

              {pagoMovilError && (
                <div className="flex items-center space-x-1.5 text-xs text-rose-400 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{pagoMovilError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pixel-green to-emerald-400 hover:brightness-105 text-black font-black text-xs shadow-xl shadow-pixel-green/30 transition active:scale-98 mt-2 flex items-center justify-center space-x-1.5"
              >
                <span>Enviar Comprobante de Pago</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* 2. Vista Efectivo USD */}
        {activeTab === PAYMENT_METHODS.EFECTIVO_USD && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <span className="text-[11px] font-black text-pixel-yellow uppercase tracking-wider block">
                Calculadora de Vuelto en Efectivo
              </span>

              <p className="text-xs text-slate-300">
                Selecciona la denominación del billete con el que vas a pagar para que el conductor tenga el cambio preparado:
              </p>

              {/* Selector de billete rápido */}
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 20, 50].map((bill) => (
                  <button
                    key={bill}
                    type="button"
                    onClick={() => setCashBill(bill)}
                    className={`py-2 rounded-xl font-black text-sm transition border ${
                      cashBill === bill
                        ? 'bg-pixel-yellow text-black border-pixel-yellow shadow-md shadow-pixel-yellow/30'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    ${bill}
                  </button>
                ))}
              </div>

              {/* Resultado del Vuelto */}
              <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Monto del viaje:</span>
                  <span className="font-semibold text-white">{formatUsd(ride.fareUsd)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Billete entregado:</span>
                  <span className="font-semibold text-white">${cashBill}.00</span>
                </div>
                <div className="flex justify-between text-white font-bold pt-1 border-t border-white/10">
                  <span className="text-pixel-yellow">Vuelto a recibir:</span>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-pixel-yellow">
                      {formatUsd(changeResult.changeUsd)}
                    </span>
                    <span className="block text-[11px] text-pixel-greenLight font-semibold">
                      ({formatBs(changeResult.changeBs)})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmitCash}
              className="w-full py-3.5 rounded-2xl bg-pixel-yellow hover:brightness-105 text-black font-black text-xs shadow-xl shadow-pixel-yellow/30 transition active:scale-98"
            >
              Confirmar Pago en Efectivo (${cashBill})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
