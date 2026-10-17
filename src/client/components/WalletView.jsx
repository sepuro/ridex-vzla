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
  Copy
} from 'lucide-react';
import { formatUsd, formatBs } from '../utils/formatters.js';
import { VENEZUELAN_BANKS } from '../utils/banks.js';

export function WalletView({ bcvRate = 54.20, role = 'passenger' }) {
  const [balanceUsd, setBalanceUsd] = useState(role === 'driver' ? 84.50 : 25.00);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);

  const balanceBs = Math.round(balanceUsd * bcvRate * 100) / 100;

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

  // Transacciones recientes
  const transactions = [
    {
      id: 'TX-901',
      title: role === 'driver' ? 'Carrera #RX-1042 (Pago Móvil)' : 'Pago de Carrera #RX-1042',
      date: 'Hoy, 10:22 AM',
      type: role === 'driver' ? 'income' : 'expense',
      amountUsd: 2.80,
      amountBs: 151.76,
      reference: '918234',
      bank: 'Banco de Venezuela'
    },
    {
      id: 'TX-892',
      title: role === 'driver' ? 'Carrera #RX-1038 (Efectivo)' : 'Pago de Carrera #RX-1038',
      date: 'Ayer, 06:48 PM',
      type: role === 'driver' ? 'income' : 'expense',
      amountUsd: 4.50,
      amountBs: 243.90,
      reference: 'Efectivo',
      bank: 'Divisas USD'
    },
    {
      id: 'TX-880',
      title: 'Recarga Billetera vía Pago Móvil',
      date: '14 Octubre, 11:30 AM',
      type: 'income',
      amountUsd: 20.00,
      amountBs: 1084.00,
      reference: '662019',
      bank: 'Banesco'
    }
  ];

  return (
    <div className="space-y-4 animate-fade-in pb-16">
      {/* Título */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-white tracking-tight">Billetera RideX</h2>
        <span className="text-xs text-accentGreen font-bold flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Fondos Seguros</span>
        </span>
      </div>

      {/* Tarjeta de Saldo Principal */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-cardBg via-surfaceBg to-darkBg border border-borderCol shadow-2xl relative overflow-hidden space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {role === 'driver' ? 'Ganancias Acumuladas' : 'Saldo Disponible'}
            </span>
            <div className="text-2xl font-black text-white tracking-tight mt-1">
              {formatUsd(balanceUsd)}
            </div>
            <div className="text-xs font-bold text-accentGreen mt-0.5">
              ≈ {formatBs(balanceBs)} <span className="text-[10px] text-slate-400 font-normal">(Tasa: Bs. {bcvRate.toFixed(2)})</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-accentGreen/15 border border-accentGreen/30 flex items-center justify-center text-accentGreen font-black">
            $
          </div>
        </div>

        {/* Botones de Acción de Billetera */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-borderCol/60">
          <button
            onClick={() => alert('Para recargar saldo, transfiere por Pago Móvil a las cuentas de la plataforma.')}
            className="py-2.5 px-3 rounded-2xl bg-accentGreen hover:bg-emerald-400 text-black font-extrabold text-xs shadow-md transition active:scale-95 flex items-center justify-center space-x-1.5"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Recargar Saldo</span>
          </button>

          <button
            onClick={() => alert(`Retiro de fondos hacia tu Pago Móvil: ${savedAccounts[0]?.bankName} (${savedAccounts[0]?.phone}). Procesado en menos de 15 minutos.`)}
            className="py-2.5 px-3 rounded-2xl bg-surfaceBg hover:bg-surfaceBg/80 border border-borderCol text-white font-bold text-xs transition active:scale-95 flex items-center justify-center space-x-1.5"
          >
            <ArrowUpRight className="w-4 h-4 text-accentYellow" />
            <span>Retirar Fondos</span>
          </button>
        </div>
      </div>

      {/* Cuentas de Pago Móvil Afiliadas */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Cuentas para Pago Móvil
          </h3>
          <button
            onClick={() => alert('Ingresa tu banco, teléfono y cédula para registrar una nueva cuenta de Pago Móvil.')}
            className="text-xs font-bold text-accentGreen flex items-center space-x-1 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar</span>
          </button>
        </div>

        <div className="space-y-2">
          {savedAccounts.map((acc) => (
            <div
              key={acc.id}
              className="p-3.5 rounded-2xl bg-cardBg border border-borderCol shadow-md flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-surfaceBg border border-borderCol flex items-center justify-center text-accentGreen">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-white text-xs">{acc.bankName}</h4>
                    {acc.isPrimary && (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-accentGreen/20 text-accentGreen border border-accentGreen/30">
                        Principal
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">{acc.phone} • {acc.idDoc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historial de Transacciones */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Movimientos Recientes
        </h3>

        <div className="space-y-2">
          {transactions.map((tx) => {
            const isIncome = tx.type === 'income';

            return (
              <div
                key={tx.id}
                className="p-3.5 rounded-2xl bg-cardBg border border-borderCol shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isIncome ? 'bg-emerald-500/15 text-accentGreen' : 'bg-red-500/15 text-dangerRed'
                  }`}>
                    {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs truncate max-w-[170px]">{tx.title}</h4>
                    <span className="text-[10px] text-slate-400 block">{tx.date} • {tx.bank}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-black block ${
                    isIncome ? 'text-accentGreen' : 'text-slate-200'
                  }`}>
                    {isIncome ? '+' : '-'}{formatUsd(tx.amountUsd)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    {formatBs(tx.amountBs)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
