import React, { useState } from 'react';
import { X, Smartphone, Banknote, QrCode, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-cardBg border-t sm:border border-borderCol p-5 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-borderCol">
          <div>
            <h3 className="font-extrabold text-white text-base">Liquidar Pago del Viaje</h3>
            <p className="text-xs text-slate-400">Total a pagar: <strong className="text-white">{formatUsd(ride.fareUsd)}</strong> ({formatBs(ride.fareBs)})</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-surfaceBg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Métodos de Pago */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={() => setActiveTab(PAYMENT_METHODS.PAGO_MOVIL)}
            className={`py-2.5 px-3 rounded-2xl flex items-center justify-center space-x-1.5 text-xs font-bold transition border ${
              activeTab === PAYMENT_METHODS.PAGO_MOVIL
                ? 'bg-accentGreen/15 border-accentGreen text-accentGreen'
                : 'bg-surfaceBg/60 border-borderCol text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Pago Móvil</span>
          </button>

          <button
            onClick={() => setActiveTab(PAYMENT_METHODS.EFECTIVO_USD)}
            className={`py-2.5 px-3 rounded-2xl flex items-center justify-center space-x-1.5 text-xs font-bold transition border ${
              activeTab === PAYMENT_METHODS.EFECTIVO_USD
                ? 'bg-accentYellow/15 border-accentYellow text-accentYellow'
                : 'bg-surfaceBg/60 border-borderCol text-slate-400 hover:text-white'
            }`}
          >
            <Banknote className="w-4 h-4" />
            <span>Efectivo USD</span>
          </button>
        </div>

        {/* 1. Vista Pago Móvil */}
        {activeTab === PAYMENT_METHODS.PAGO_MOVIL && (
          <div className="mt-4 space-y-4">
            {/* Tarjeta con los datos de cobro del conductor */}
            <div className="p-3.5 rounded-2xl bg-surfaceBg/90 border border-borderCol relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-accentGreen uppercase tracking-wider">
                  Datos de Pago Móvil del Conductor
                </span>
                <button
                  onClick={handleCopyPaymentData}
                  className="flex items-center space-x-1 text-[11px] font-semibold text-slate-300 hover:text-accentGreen"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-accentGreen" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Banco:</span>
                  <span className="font-semibold text-white">{driverPaymentData.bank}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Teléfono:</span>
                  <span className="font-mono font-semibold text-white">{driverPaymentData.phone}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Cédula:</span>
                  <span className="font-mono font-semibold text-white">{driverPaymentData.idDoc}</span>
                </div>
                <div className="flex justify-between text-slate-300 pt-1 border-t border-borderCol/60">
                  <span className="font-bold text-slate-300">Monto exacto:</span>
                  <span className="font-black text-accentGreen text-sm">{formatBs(ride.fareBs)}</span>
                </div>
              </div>
            </div>

            {/* Formulario de reporte de Pago Móvil */}
            <form onSubmit={handleSubmitPagoMovil} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tu Banco Emisor
                </label>
                <select
                  value={senderBank}
                  onChange={(e) => setSenderBank(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surfaceBg border border-borderCol text-xs font-medium text-white focus:outline-none focus:border-accentGreen"
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Teléfono Emisor
                  </label>
                  <input
                    type="text"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="04121234567"
                    className="w-full p-2.5 rounded-xl bg-surfaceBg border border-borderCol text-xs font-mono text-white focus:outline-none focus:border-accentGreen"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cédula / RIF
                  </label>
                  <input
                    type="text"
                    value={senderId}
                    onChange={(e) => setSenderId(e.target.value)}
                    placeholder="V-12345678"
                    className="w-full p-2.5 rounded-xl bg-surfaceBg border border-borderCol text-xs font-mono text-white focus:outline-none focus:border-accentGreen"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Número de Referencia (4 a 8 dígitos)
                </label>
                <input
                  type="text"
                  maxLength={8}
                  value={reference}
                  onChange={(e) => setReference(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ej: 849302"
                  className="w-full p-3 rounded-xl bg-surfaceBg border border-borderCol text-sm font-mono font-bold text-accentGreen tracking-widest focus:outline-none focus:border-accentGreen"
                  required
                />
              </div>

              {pagoMovilError && (
                <div className="flex items-center space-x-1.5 text-xs text-dangerRed font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{pagoMovilError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-accentGreen hover:bg-emerald-400 text-black font-extrabold text-sm shadow-xl shadow-accentGreen/20 transition active:scale-98 mt-2"
              >
                Enviar Comprobante de Pago
              </button>
            </form>
          </div>
        )}

        {/* 2. Vista Efectivo USD */}
        {activeTab === PAYMENT_METHODS.EFECTIVO_USD && (
          <div className="mt-4 space-y-4">
            <div className="p-3.5 rounded-2xl bg-surfaceBg/90 border border-borderCol space-y-3">
              <span className="text-[11px] font-bold text-accentYellow uppercase tracking-wider block">
                Calculadora de Vuelto en Efectivo
              </span>

              <p className="text-xs text-slate-300">
                Selecciona la denominación del billete con el que vas a pagar para que el conductor tenga el cambio preparado:
              </p>

              {/* Selector de billete */}
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 20, 50].map((bill) => (
                  <button
                    key={bill}
                    type="button"
                    onClick={() => setCashBill(bill)}
                    className={`py-2 rounded-xl font-black text-sm transition border ${
                      cashBill === bill
                        ? 'bg-accentYellow text-black border-accentYellow shadow-md shadow-amber-500/20'
                        : 'bg-surfaceBg border-borderCol text-slate-300 hover:text-white'
                    }`}
                  >
                    ${bill}
                  </button>
                ))}
              </div>

              {/* Resultado del Vuelto */}
              <div className="p-3 rounded-xl bg-darkBg border border-borderCol space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Monto del viaje:</span>
                  <span className="font-semibold text-white">{formatUsd(ride.fareUsd)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Billete entregado:</span>
                  <span className="font-semibold text-white">${cashBill}.00</span>
                </div>
                <div className="flex justify-between text-white font-bold pt-1 border-t border-borderCol/60">
                  <span className="text-accentYellow">Vuelto a recibir:</span>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-accentYellow">
                      {formatUsd(changeResult.changeUsd)}
                    </span>
                    <span className="block text-[11px] text-accentGreen font-semibold">
                      ({formatBs(changeResult.changeBs)})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmitCash}
              className="w-full py-3.5 rounded-2xl bg-accentYellow hover:bg-amber-400 text-black font-extrabold text-sm shadow-xl shadow-amber-500/20 transition active:scale-98"
            >
              Confirmar Pago en Efectivo (${cashBill})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
