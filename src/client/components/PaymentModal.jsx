import React, { useState } from 'react';
import { X, Smartphone, Banknote, QrCode, Copy, CheckCircle2, AlertCircle, ArrowRight, Wallet, Sparkles } from 'lucide-react';
import { PAYMENT_METHODS } from '../../shared/constants.js';
import { VENEZUELAN_BANKS, validatePagoMovil, calculateCashChange } from '../utils/banks.js';
import { formatUsd, formatBs } from '../utils/formatters.js';
import { triggerHaptic } from '../utils/soundEffects.js';

export function PaymentModal({
  isOpen,
  onClose,
  ride,
  onSubmitPayment,
  currentUser = null
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
    triggerHaptic(40);
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
      triggerHaptic(80);
      return;
    }

    triggerHaptic(100);
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

    triggerHaptic(100);
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in safe-area-pb select-none">
      <div className="w-full max-w-md rounded-t-[32px] sm:rounded-[32px] bg-[#0D111A] border-t sm:border border-white/15 p-5 shadow-2xl backdrop-blur-2xl max-h-[90vh] overflow-y-auto no-scrollbar text-slate-100 space-y-4">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div>
            <h3 className="font-black text-white text-base">Liquidar Pago del Viaje</h3>
            <p className="text-xs text-slate-400">
              Total a pagar: <strong className="text-white">{formatUsd(ride.fareUsd)}</strong>{' '}
              <span className="text-[#00E599] font-bold">({formatBs(ride.fareBs)})</span>
            </p>
          </div>
          <button
            onClick={() => {
              triggerHaptic(30);
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pestañas de Métodos de Pago */}
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => {
              triggerHaptic(30);
              setActiveTab(PAYMENT_METHODS.PAGO_MOVIL);
            }}
            className={`py-2 px-1.5 rounded-2xl flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1 text-[11px] font-black transition-colors duration-140 border tap-scale ${
              activeTab === PAYMENT_METHODS.PAGO_MOVIL
                ? 'bg-[#00E599] text-black border-[#00E599] shadow-lg shadow-[#00E599]/25'
                : 'bg-white/[0.05] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="truncate">Pago Móvil</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic(30);
              setActiveTab(PAYMENT_METHODS.WALLET);
            }}
            className={`py-2 px-1.5 rounded-2xl flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1 text-[11px] font-black transition-colors duration-140 border tap-scale ${
              activeTab === PAYMENT_METHODS.WALLET
                ? 'bg-[#00D2FF] text-black border-[#00D2FF] shadow-lg shadow-[#00D2FF]/25'
                : 'bg-white/[0.05] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span className="truncate">Billetera</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic(30);
              setActiveTab(PAYMENT_METHODS.EFECTIVO_USD);
            }}
            className={`py-2 px-1.5 rounded-2xl flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1 text-[11px] font-black transition-colors duration-140 border tap-scale ${
              activeTab === PAYMENT_METHODS.EFECTIVO_USD
                ? 'bg-[#FFB800] text-black border-[#FFB800] shadow-lg shadow-[#FFB800]/25'
                : 'bg-white/[0.05] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <Banknote className="w-3.5 h-3.5" />
            <span className="truncate">Efectivo</span>
          </button>
        </div>

        {/* 1. Vista Billetera RideX */}
        {activeTab === PAYMENT_METHODS.WALLET && (() => {
          const userBalance = typeof currentUser?.walletBalanceUsd === 'number' ? currentUser.walletBalanceUsd : 25.00;
          const hasSufficientBalance = userBalance >= ride.fareUsd;

          return (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#141A26] to-[#0A0E17] border border-white/[0.12] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Saldo Disponible en Billetera
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                    hasSufficientBalance
                      ? 'text-[#00E599] bg-[#00E599]/15 border-[#00E599]/30'
                      : 'text-[#FF3B5C] bg-[#FF3B5C]/15 border-[#FF3B5C]/30'
                  }`}>
                    {hasSufficientBalance ? 'Débito Inmediato' : 'Saldo Insuficiente'}
                  </span>
                </div>

                <div>
                  <div className="text-2xl font-black text-white">{formatUsd(userBalance)}</div>
                  <div className="text-xs text-[#00E599] font-bold mt-0.5">
                    ≈ {formatBs(userBalance * (ride.bcvRate || 880))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.08] space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Monto a liquidar:</span>
                    <span className="font-bold text-white">{formatUsd(ride.fareUsd)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Saldo tras el pago:</span>
                    <span className={`font-bold ${hasSufficientBalance ? 'text-[#00E599]' : 'text-[#FF7088]'}`}>
                      {formatUsd(Math.max(0, userBalance - ride.fareUsd))}
                    </span>
                  </div>
                </div>

                {!hasSufficientBalance && (
                  <div className="p-2.5 rounded-xl bg-[#FF3B5C]/10 border border-[#FF3B5C]/30 text-[#FF7088] text-[11px] flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Recarga tu billetera vía Pago Móvil o selecciona Efectivo/Pago Móvil para pagar este viaje.</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={!hasSufficientBalance}
                onClick={() => {
                  triggerHaptic(100);
                  onSubmitPayment({
                    method: PAYMENT_METHODS.WALLET,
                    amountUsd: ride.fareUsd,
                    amountBs: ride.fareBs,
                    bcvRate: ride.bcvRate,
                    reference: 'WAL-' + Math.floor(100000 + Math.random() * 900000)
                  });
                  onClose();
                }}
                className={`w-full py-3.5 rounded-2xl font-black text-xs shadow-xl transition-transform duration-140 flex items-center justify-center space-x-2 ${
                  hasSufficientBalance
                    ? 'bg-gradient-to-r from-[#00D2FF] to-[#00E599] text-black shadow-[#00D2FF]/30 tap-scale cursor-pointer shimmer-button'
                    : 'bg-white/10 text-slate-500 cursor-not-allowed shadow-none'
                }`}
              >
                <Wallet className="w-4 h-4 stroke-[2.5]" />
                <span>{hasSufficientBalance ? `Confirmar Pago con Billetera • ${formatUsd(ride.fareUsd)}` : 'Saldo Insuficiente en Billetera'}</span>
              </button>
            </div>
          );
        })()}

        {/* 2. Vista Pago Móvil */}
        {activeTab === PAYMENT_METHODS.PAGO_MOVIL && (
          <div className="space-y-4 animate-fade-in">
            {/* Tarjeta con los datos de cobro del conductor */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-white/[0.08]">
                <span className="text-[11px] font-black text-[#00E599] uppercase tracking-wider">
                  Datos del Conductor
                </span>
                <button
                  onClick={handleCopyPaymentData}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-[#00E599]/15 text-[#00E599] hover:bg-[#00E599]/25 border border-[#00E599]/30 text-[11px] font-bold tap-scale transition-colors duration-140"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#00E599]" /> : <Copy className="w-3.5 h-3.5" />}
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
                <div className="flex justify-between pt-1 border-t border-white/[0.08]">
                  <span className="font-bold text-slate-300">Monto exacto:</span>
                  <span className="font-black text-[#00E599] text-sm">{formatBs(ride.fareBs)}</span>
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
                  className="w-full p-2.5 rounded-xl bg-black/60 border border-white/15 text-xs font-medium text-white focus:outline-none focus:border-[#00E599]"
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
                    className="w-full p-2.5 rounded-xl bg-black/60 border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-[#00E599]"
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
                    className="w-full p-2.5 rounded-xl bg-black/60 border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-[#00E599]"
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
                  className="w-full p-3 rounded-xl bg-black/60 border border-white/15 text-sm font-mono font-bold text-[#00E599] text-center tracking-widest focus:outline-none focus:border-[#00E599]"
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
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00E599] to-[#00D2FF] text-black font-black text-xs shadow-xl shadow-[#00E599]/30 tap-scale shimmer-button transition-transform duration-140 mt-2 flex items-center justify-center space-x-1.5"
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
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.08] space-y-3">
              <span className="text-[11px] font-black text-[#FFB800] uppercase tracking-wider block">
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
                    onClick={() => {
                      triggerHaptic(25);
                      setCashBill(bill);
                    }}
                    className={`py-2 rounded-xl font-black text-sm border tap-scale transition-colors duration-140 ${
                      cashBill === bill
                        ? 'bg-[#FFB800] text-black border-[#FFB800] shadow-md shadow-[#FFB800]/25'
                        : 'bg-white/[0.05] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    ${bill}
                  </button>
                ))}
              </div>

              {/* Resultado del Vuelto */}
              <div className="p-3 rounded-xl bg-black/60 border border-white/[0.08] space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Monto del viaje:</span>
                  <span className="font-semibold text-white">{formatUsd(ride.fareUsd)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Billete entregado:</span>
                  <span className="font-semibold text-white">${cashBill}.00</span>
                </div>
                <div className="flex justify-between text-white font-bold pt-1 border-t border-white/[0.08]">
                  <span className="text-[#FFB800]">Vuelto a recibir:</span>
                  <div className="text-right">
                    <span className="text-sm font-black text-[#FFB800]">
                      {formatUsd(changeResult.changeUsd)}
                    </span>
                    <span className="block text-[11px] text-[#00E599] font-black">
                      ({formatBs(changeResult.changeBs)})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmitCash}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FFB800] to-amber-500 text-black font-black text-xs shadow-xl shadow-[#FFB800]/25 tap-scale shimmer-button transition-transform duration-140"
            >
              Confirmar Pago en Efectivo (${cashBill})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
