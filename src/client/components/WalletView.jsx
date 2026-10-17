import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Smartphone,
  Banknote,
  Plus,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Copy,
  X,
  CreditCard,
  Building,
  Check
} from 'lucide-react';
import { formatUsd, formatBs } from '../utils/formatters.js';
import { VENEZUELAN_BANKS } from '../utils/banks.js';
import { DEFAULT_BCV_RATE } from '../../shared/constants.js';
import { triggerHaptic, playAcceptChime } from '../utils/soundEffects.js';

export function WalletView({ bcvRate = DEFAULT_BCV_RATE, role = 'passenger' }) {
  const [balanceUsd, setBalanceUsd] = useState(role === 'driver' ? 84.50 : 25.00);
  const [copiedBank, setCopiedBank] = useState(false);

  // Modales de Billetera
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);

  // Estado del Formulario de Recarga
  const [topUpAmountUsd, setTopUpAmountUsd] = useState(10);
  const [topUpReference, setTopUpReference] = useState('');
  const [topUpBank, setTopUpBank] = useState('0102');
  const [topUpSuccess, setTopUpSuccess] = useState(false);

  // Estado del Formulario de Retiro
  const [withdrawAmountUsd, setWithdrawAmountUsd] = useState(10);
  const [selectedWithdrawAccount, setSelectedWithdrawAccount] = useState(1);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // Estado de Nueva Cuenta
  const [newBankCode, setNewBankCode] = useState('0102');
  const [newPhone, setNewPhone] = useState('0412-');
  const [newIdDoc, setNewIdDoc] = useState('V-');

  // Cuentas de Pago Móvil guardadas
  const [savedAccounts, setSavedAccounts] = useState([
    {
      id: 1,
      bankCode: '0102',
      bankName: 'Banco de Venezuela',
      phone: '0412-1234567',
      idDoc: 'V-24555666',
      isPrimary: true
    },
    {
      id: 2,
      bankCode: '0134',
      bankName: 'Banesco Banco Universal',
      phone: '0414-9876543',
      idDoc: 'V-24555666',
      isPrimary: false
    }
  ]);

  // Historial de transacciones con estado dinámico
  const [transactions, setTransactions] = useState([
    {
      id: 'TX-901',
      title: role === 'driver' ? 'Carrera #RX-1042 (Pago Móvil)' : 'Pago de Carrera #RX-1042',
      date: 'Hoy, 10:22 AM',
      type: role === 'driver' ? 'income' : 'expense',
      amountUsd: 2.80,
      amountBs: Math.round(2.80 * bcvRate * 100) / 100,
      reference: '918234',
      bank: 'Banco de Venezuela'
    },
    {
      id: 'TX-892',
      title: role === 'driver' ? 'Carrera #RX-1038 (Efectivo)' : 'Pago de Carrera #RX-1038',
      date: 'Ayer, 06:48 PM',
      type: role === 'driver' ? 'income' : 'expense',
      amountUsd: 4.50,
      amountBs: Math.round(4.50 * bcvRate * 100) / 100,
      reference: 'Efectivo',
      bank: 'Divisas USD'
    },
    {
      id: 'TX-880',
      title: 'Recarga Billetera vía Pago Móvil',
      date: '14 Octubre, 11:30 AM',
      type: 'income',
      amountUsd: 20.00,
      amountBs: Math.round(20.00 * bcvRate * 100) / 100,
      reference: '662019',
      bank: 'Banesco'
    }
  ]);

  const balanceBs = Math.round(balanceUsd * bcvRate * 100) / 100;

  // Datos bancarios oficiales de RideX para recibir Pago Móvil
  const platformPaymentDetails = {
    bank: '0102 - Banco de Venezuela',
    phone: '0412-7654321',
    rif: 'J-50123456-7',
    name: 'RideX Venezuela C.A.'
  };

  const handleCopyPlatformData = () => {
    const text = `Pago Móvil RideX:\nBanco: ${platformPaymentDetails.bank}\nTel: ${platformPaymentDetails.phone}\nRIF: ${platformPaymentDetails.rif}\nTitular: ${platformPaymentDetails.name}`;
    navigator.clipboard?.writeText(text);
    setCopiedBank(true);
    triggerHaptic(40);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  // Procesar Recarga
  const handleConfirmTopUp = (e) => {
    e.preventDefault();
    if (!topUpReference.trim()) {
      alert('Por favor ingrese el número de referencia bancaria');
      return;
    }

    const addedAmount = Number(topUpAmountUsd);
    setBalanceUsd((prev) => Math.round((prev + addedAmount) * 100) / 100);

    const newTx = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      title: 'Recarga Saldo vía Pago Móvil',
      date: 'Justo ahora',
      type: 'income',
      amountUsd: addedAmount,
      amountBs: Math.round(addedAmount * bcvRate * 100) / 100,
      reference: topUpReference.trim(),
      bank: VENEZUELAN_BANKS.find(b => b.code === topUpBank)?.name || 'Banco de Venezuela'
    };

    setTransactions((prev) => [newTx, ...prev]);
    setTopUpSuccess(true);
    playAcceptChime();
    triggerHaptic(100);

    setTimeout(() => {
      setTopUpSuccess(false);
      setShowTopUpModal(false);
      setTopUpReference('');
    }, 1200);
  };

  // Procesar Retiro
  const handleConfirmWithdraw = (e) => {
    e.preventDefault();
    const withdrawAmount = Number(withdrawAmountUsd);

    if (withdrawAmount <= 0 || withdrawAmount > balanceUsd) {
      alert('Monto de retiro inválido o superior al saldo disponible');
      return;
    }

    setBalanceUsd((prev) => Math.round((prev - withdrawAmount) * 100) / 100);

    const account = savedAccounts.find(a => a.id === selectedWithdrawAccount) || savedAccounts[0];
    const newTx = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `Retiro de Fondos (${account.bankName})`,
      date: 'Justo ahora',
      type: 'expense',
      amountUsd: withdrawAmount,
      amountBs: Math.round(withdrawAmount * bcvRate * 100) / 100,
      reference: 'Pendiente',
      bank: account.bankName
    };

    setTransactions((prev) => [newTx, ...prev]);
    setWithdrawSuccess(true);
    playAcceptChime();
    triggerHaptic(100);

    setTimeout(() => {
      setWithdrawSuccess(false);
      setShowWithdrawModal(false);
    }, 1200);
  };

  // Agregar Cuenta
  const handleAddAccount = (e) => {
    e.preventDefault();
    if (!newPhone.trim() || !newIdDoc.trim()) {
      alert('Por favor complete todos los datos');
      return;
    }

    const bankObj = VENEZUELAN_BANKS.find(b => b.code === newBankCode);
    const newAcc = {
      id: Date.now(),
      bankCode: newBankCode,
      bankName: bankObj ? bankObj.name : 'Banco Venezolano',
      phone: newPhone.trim(),
      idDoc: newIdDoc.trim().toUpperCase(),
      isPrimary: false
    };

    setSavedAccounts((prev) => [...prev, newAcc]);
    triggerHaptic(60);
    setShowAddAccountModal(false);
    setNewPhone('0412-');
    setNewIdDoc('V-');
  };

  return (
    <div className="space-y-4 animate-fade-in pb-20 select-none">
      {/* 1. Título y Garantía de Fondos */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight">Billetera Digital RideX</h2>
          <p className="text-[10px] text-slate-400 font-medium">Fintech adaptada a bolívares y divisas</p>
        </div>
        <span className="text-xs text-pixel-greenLight font-bold flex items-center space-x-1 bg-pixel-green/10 px-2.5 py-1 rounded-full border border-pixel-green/20">
          <ShieldCheck className="w-3.5 h-3.5 text-pixel-greenLight" />
          <span>Fondos Garantizados</span>
        </span>
      </div>

      {/* 2. Tarjeta de Saldo Principal con degradado minimalista y glassmorphism */}
      <div className="p-5 rounded-[28px] bg-gradient-to-br from-[#121622] via-[#161c2a] to-[#0d1017] border border-white/15 shadow-[0_15px_40px_rgba(0,0,0,0.5)] relative overflow-hidden space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
              {role === 'driver' ? 'Ganancias Acumuladas' : 'Saldo Disponible'}
            </span>
            <div className="text-3xl font-black text-white tracking-tight mt-1">
              {formatUsd(balanceUsd)}
            </div>
            <div className="text-xs font-extrabold text-pixel-greenLight mt-0.5">
              ≈ {formatBs(balanceBs)}{' '}
              <span className="text-[10px] text-slate-400 font-normal">
                (BCV Oficial: Bs. {typeof bcvRate === 'number' ? bcvRate.toFixed(2) : bcvRate})
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-pixel-green/20 border border-pixel-green/40 flex items-center justify-center text-pixel-greenLight font-black text-lg shadow-sm">
            $
          </div>
        </div>

        {/* Botones de Acción de Billetera (Recargar / Retirar) */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
          <button
            onClick={() => {
              triggerHaptic(40);
              setShowTopUpModal(true);
            }}
            className="py-3 px-3 rounded-2xl bg-gradient-to-r from-pixel-green to-emerald-400 hover:brightness-105 text-black font-black text-xs shadow-md transition active:scale-95 flex items-center justify-center space-x-1.5"
          >
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Recargar Saldo</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic(40);
              setShowWithdrawModal(true);
            }}
            className="py-3 px-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-extrabold text-xs transition active:scale-95 flex items-center justify-center space-x-1.5"
          >
            <ArrowUpRight className="w-4 h-4 text-pixel-yellow" />
            <span>Retirar Fondos</span>
          </button>
        </div>
      </div>

      {/* 3. Cuentas Afiliadas para Pago Móvil */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            Cuentas para Pago Móvil
          </h3>
          <button
            onClick={() => {
              triggerHaptic(30);
              setShowAddAccountModal(true);
            }}
            className="text-xs font-extrabold text-pixel-greenLight flex items-center space-x-1 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Cuenta</span>
          </button>
        </div>

        <div className="space-y-2">
          {savedAccounts.map((acc) => (
            <div
              key={acc.id}
              className="p-3.5 rounded-2xl bg-[#111622]/85 backdrop-blur-xl border border-white/10 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-pixel-blueLight">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h4 className="font-bold text-white text-xs">{acc.bankName}</h4>
                    {acc.isPrimary && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-pixel-green/20 text-pixel-greenLight border border-pixel-green/30">
                        Principal
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{acc.phone} • {acc.idDoc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Historial de Transacciones Recientes */}
      <div className="space-y-2.5">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
          Movimientos Recientes
        </h3>

        <div className="space-y-2">
          {transactions.map((tx) => {
            const isIncome = tx.type === 'income';
            return (
              <div
                key={tx.id}
                className="p-3.5 rounded-2xl bg-[#111622]/85 backdrop-blur-xl border border-white/10 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isIncome ? 'bg-pixel-green/15 text-pixel-greenLight' : 'bg-pixel-red/15 text-pixel-redLight'
                  }`}>
                    {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs truncate max-w-[180px]">{tx.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{tx.date} • Ref: {tx.reference}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-xs font-black ${isIncome ? 'text-pixel-greenLight' : 'text-slate-200'}`}>
                    {isIncome ? '+' : '-'}{formatUsd(tx.amountUsd)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold">
                    {formatBs(tx.amountBs)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- MODAL 1: RECARGA DE SALDO VIA PAGO MÓVIL --- */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in safe-area-pb">
          <div className="w-full max-w-sm rounded-[28px] bg-[#0d121c]/95 border border-white/15 p-5 shadow-2xl backdrop-blur-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <ArrowDownLeft className="w-5 h-5 text-pixel-greenLight" />
                <h3 className="font-extrabold text-white text-sm">Recargar Billetera RideX</h3>
              </div>
              <button
                onClick={() => setShowTopUpModal(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Datos de Pago Móvil de la Plataforma con 1-Tap Copy */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Transferir a datos oficiales RideX</span>
                <button
                  type="button"
                  onClick={handleCopyPlatformData}
                  className="flex items-center space-x-1 text-pixel-greenLight hover:underline font-bold text-[11px]"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedBank ? '¡Copiado!' : 'Copiar datos'}</span>
                </button>
              </div>

              <div className="space-y-1 font-mono text-[11px]">
                <p><span className="text-slate-400">Banco:</span> <strong className="text-white">{platformPaymentDetails.bank}</strong></p>
                <p><span className="text-slate-400">Teléfono:</span> <strong className="text-white">{platformPaymentDetails.phone}</strong></p>
                <p><span className="text-slate-400">RIF:</span> <strong className="text-white">{platformPaymentDetails.rif}</strong></p>
                <p><span className="text-slate-400">Titular:</span> <strong className="text-white">{platformPaymentDetails.name}</strong></p>
              </div>
            </div>

            {topUpSuccess && (
              <div className="p-3 rounded-2xl bg-pixel-green/20 border border-pixel-green/40 text-pixel-greenLight text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>¡Recarga procesada exitosamente! Saldo acreditado.</span>
              </div>
            )}

            <form onSubmit={handleConfirmTopUp} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Seleccionar Monto a Recargar:</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[5, 10, 20, 50].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopUpAmountUsd(amt)}
                      className={`py-2 rounded-xl border text-center font-bold transition ${
                        topUpAmountUsd === amt
                          ? 'bg-pixel-green/20 border-pixel-green text-pixel-greenLight'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-pixel-greenLight font-bold mt-1 text-right">
                  Equivalente: {formatBs(Math.round(topUpAmountUsd * bcvRate * 100) / 100)} (BCV)
                </p>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Número de Referencia Bancaria (4 a 8 dígitos):</label>
                <input
                  type="text"
                  required
                  value={topUpReference}
                  onChange={(e) => setTopUpReference(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ej: 918234"
                  maxLength={8}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white font-mono font-bold text-center tracking-widest text-sm focus:outline-none focus:border-pixel-green"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-pixel-green text-black font-black text-xs shadow-lg active:scale-98 transition flex items-center justify-center space-x-1.5"
              >
                <span>Confirmar y Acreditar Saldo</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: RETIRO DE FONDOS --- */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in safe-area-pb">
          <div className="w-full max-w-sm rounded-[28px] bg-[#0d121c]/95 border border-white/15 p-5 shadow-2xl backdrop-blur-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <ArrowUpRight className="w-5 h-5 text-pixel-yellow" />
                <h3 className="font-extrabold text-white text-sm">Retirar Fondos a Pago Móvil</h3>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-xs">
              <span className="text-slate-400">Saldo disponible para retiro:</span>
              <p className="text-lg font-black text-white">{formatUsd(balanceUsd)} ({formatBs(balanceBs)})</p>
            </div>

            {withdrawSuccess && (
              <div className="p-3 rounded-2xl bg-pixel-green/20 border border-pixel-green/40 text-pixel-greenLight text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>¡Retiro procesado! Fondos transferidos a tu Pago Móvil.</span>
              </div>
            )}

            <form onSubmit={handleConfirmWithdraw} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Monto a retirar en USD:</label>
                <input
                  type="number"
                  min="1"
                  max={balanceUsd}
                  step="1"
                  value={withdrawAmountUsd}
                  onChange={(e) => setWithdrawAmountUsd(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white font-bold text-base focus:outline-none focus:border-pixel-yellow text-center"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Cuenta destino (Pago Móvil):</label>
                <select
                  value={selectedWithdrawAccount}
                  onChange={(e) => setSelectedWithdrawAccount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none"
                >
                  {savedAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.bankName} - {a.phone} ({a.idDoc})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={balanceUsd <= 0}
                className="w-full py-3 rounded-2xl bg-pixel-yellow text-black font-black text-xs shadow-lg active:scale-98 transition disabled:opacity-50"
              >
                <span>Procesar Retiro Inmediato</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: AGREGAR NUEVA CUENTA DE PAGO MÓVIL --- */}
      {showAddAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in safe-area-pb">
          <div className="w-full max-w-sm rounded-[28px] bg-[#0d121c]/95 border border-white/15 p-5 shadow-2xl backdrop-blur-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-extrabold text-white text-sm">Registrar Cuenta Pago Móvil</h3>
              <button
                onClick={() => setShowAddAccountModal(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Banco Emisor:</label>
                <select
                  value={newBankCode}
                  onChange={(e) => setNewBankCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white focus:outline-none"
                >
                  {VENEZUELAN_BANKS.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Teléfono Celular Afiliado:</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="0412-1234567"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Cédula o RIF del Titular:</label>
                <input
                  type="text"
                  required
                  value={newIdDoc}
                  onChange={(e) => setNewIdDoc(e.target.value.toUpperCase())}
                  placeholder="V-24555666"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white font-mono uppercase"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-pixel-green text-black font-black text-xs shadow-lg active:scale-98 transition"
              >
                Guardar Cuenta
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
