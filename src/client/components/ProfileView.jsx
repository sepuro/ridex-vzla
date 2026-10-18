import React, { useState } from 'react';
import {
  User,
  Shield,
  Award,
  Bike,
  Car,
  FileCheck,
  Bell,
  Smartphone,
  MapPin,
  MessageSquare,
  AlertTriangle,
  ChevronRight,
  LogOut,
  Camera,
  Edit3,
  HeartHandshake,
  Star,
  CheckCircle2,
  Home,
  Briefcase,
  Crown,
  Sparkles,
  Zap
} from 'lucide-react';
import { triggerHaptic } from '../utils/soundEffects.js';

export function ProfileView({
  role = 'passenger',
  onToggleRole,
  currentUser,
  onOpenAuthModal,
  onOpenEditProfile,
  onLogout,
  onOpenVipModal
}) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [selectedCity, setSelectedCity] = useState(currentUser?.city || 'Caracas');
  const [sosActive, setSosActive] = useState(false);

  const handleTriggerSos = () => {
    triggerHaptic([300, 100, 300, 100, 500]);
    setSosActive(true);
    setTimeout(() => setSosActive(false), 5000);
  };

  const displayName = currentUser?.name || (role === 'driver' ? 'Carlos Mendoza' : 'Mariana Silva');
  const displayPhone = currentUser?.phone || (role === 'driver' ? '0412-9876543' : '0414-2345678');
  const displayNationalId = currentUser?.nationalId || (role === 'driver' ? 'V-22.987.654' : 'V-26.112.334');
  const displayRating = currentUser?.rating || 4.97;
  const displayRides = currentUser?.totalRides || (role === 'driver' ? 184 : 42);

  return (
    <div className="space-y-4 animate-fade-in pb-20 select-none">
      {/* 1. Tarjeta Principal de Perfil con Foto y Acreditación Oficial */}
      <div className="p-5 rounded-[28px] bg-[#0D111A]/95 backdrop-blur-2xl border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.5)] space-y-4">
        <div className="flex items-center space-x-4">
          {/* Avatar con Botón de Edición Rápida */}
          <div className="relative flex-shrink-0">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-[24px] bg-[#141A26] border-2 border-[#00E599]/60 overflow-hidden flex items-center justify-center shadow-lg shadow-[#00E599]/20">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-[#00E599] to-[#00D2FF] flex items-center justify-center font-black text-black text-2xl">
                  {displayName.charAt(0)}
                </div>
              )}
            </div>
            <button
              onClick={() => {
                triggerHaptic(30);
                onOpenEditProfile();
              }}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#00E599] text-black flex items-center justify-center shadow-md active:scale-90 transition border border-black font-black"
              title="Cambiar foto de perfil"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Datos del Usuario */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5">
              <h2 className="font-black text-white text-base truncate">
                {displayName}
              </h2>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#00E599]/20 text-[#00E599] border border-[#00E599]/30 flex-shrink-0">
                ✓ Verificado
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-0.5 font-mono truncate">
              {displayPhone} • {displayNationalId}
            </p>

            <div className="flex items-center space-x-2.5 mt-1.5 text-xs">
              <span className="font-extrabold text-[#FFB800] flex items-center">
                <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                {displayRating}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 font-semibold">{displayRides} carreras completadas</span>
            </div>
          </div>
        </div>

        {/* Botones Rápidos: Editar Perfil + Cambiar Rol */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.08]">
          <button
            onClick={() => {
              triggerHaptic(30);
              onOpenEditProfile();
            }}
            className="py-2.5 px-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-black text-slate-200 flex items-center justify-center space-x-1.5 transition active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#00D2FF]" />
            <span>Editar Datos</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic(40);
              onToggleRole();
            }}
            className={`py-2.5 px-3 rounded-2xl border text-xs font-black flex items-center justify-center space-x-1.5 transition active:scale-95 ${
              role === 'driver'
                ? 'bg-[#FFB800]/20 border-[#FFB800]/40 text-[#FFB800]'
                : 'bg-[#00E599]/20 border-[#00E599]/40 text-[#00E599]'
            }`}
          >
            {role === 'driver' ? <Car className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            <span>Modo {role === 'driver' ? 'Pasajero' : 'Conductor'}</span>
          </button>
        </div>
      </div>

      {/* 1.5. Membresía RideX Pass VIP (Para Pasajeros) */}
      {role === 'passenger' && (
        <div className="p-4 rounded-[26px] bg-gradient-to-br from-[#141A26] via-[#0D111A] to-[#06080D] border border-amber-500/30 shadow-lg space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-md shadow-amber-500/20">
                <Crown className="w-5 h-5 text-black" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-black text-white text-sm">RideX Pass VIP</h3>
                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full border ${
                    currentUser?.isVip
                      ? 'bg-[#00E599]/20 text-[#00E599] border-[#00E599]/30'
                      : 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                  }`}>
                    {currentUser?.isVip ? 'ACTIVO' : '15% OFF'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {currentUser?.isVip
                    ? `Vence: ${new Date(currentUser?.subscription?.expiresAt).toLocaleDateString('es-VE')}`
                    : 'Ahorro ilimitado en viajes y envíos'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic(40);
                if (onOpenVipModal) onOpenVipModal();
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs shadow-md transition active:scale-95"
            >
              {currentUser?.isVip ? 'Gestionar' : 'Activar VIP'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.08] text-[11px] text-slate-300">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>15% OFF en viajes y envíos</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-[#00E599] flex-shrink-0" />
              <span>Despacho prioritario en lluvia</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Si es Conductor: Tarjeta del Vehículo y Documentos Legales Venezolanos */}
      {role === 'driver' && (
        <div className="space-y-2">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
            Vehículo Registrado y Documentación
          </h3>

          <div className="p-4 rounded-[26px] bg-[#0D111A]/95 backdrop-blur-xl border border-white/[0.08] shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FFB800]/15 border border-[#FFB800]/30 flex items-center justify-center text-[#FFB800]">
                  {currentUser?.vehicle?.vehicleType === 'moto' ? (
                    <Bike className="w-6 h-6" />
                  ) : (
                    <Car className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-xs">
                    {currentUser?.vehicle?.model || 'Bera SBR 150'}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Placa: <strong className="text-white">{currentUser?.vehicle?.plate || 'AD712YZ'}</strong> • Color: {currentUser?.vehicle?.color || 'Rojo'}{currentUser?.vehicle?.year ? ` • Año: ${currentUser.vehicle.year}` : ''}
                  </p>
                </div>
              </div>

              {currentUser?.vehicle?.hasAc && (
                <span className="px-2 py-0.5 rounded-full bg-[#00E599]/20 text-[#00E599] text-[10px] font-black border border-[#00E599]/30">
                  ❄️ A/C Full
                </span>
              )}
            </div>

            {/* Checklist de Documentos INTT */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.08] text-[11px]">
              <div className="flex items-center space-x-1.5 text-slate-300">
                <FileCheck className="w-4 h-4 text-[#00E599]" />
                <span>Licencia: <strong className="text-white font-bold">Vigente INTT</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-300">
                <FileCheck className="w-4 h-4 text-[#00E599]" />
                <span>Seguro RCV: <strong className="text-white font-bold">Activo</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-300">
                <FileCheck className="w-4 h-4 text-[#00E599]" />
                <span>Certif. Médico: <strong className="text-white font-bold">Aprobado</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-300">
                <FileCheck className="w-4 h-4 text-[#00E599]" />
                <span>Carnet Circulación: <strong className="text-white font-bold">Al día</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Lugares Frecuentes Guardados */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
          Lugares Guardados
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-2xl bg-[#0D111A] border border-white/[0.08] flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00D2FF]/15 text-[#00D2FF] flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Casa</span>
              <p className="text-xs font-semibold text-white truncate">Altamira, Chacao</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#0D111A] border border-white/[0.08] flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFB800]/15 text-[#FFB800] flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Trabajo</span>
              <p className="text-xs font-semibold text-white truncate">Las Mercedes, Caracas</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Centro de Seguridad SOS (VEN 911) */}
      <div className="p-4 rounded-[26px] bg-[#FF3B5C]/10 border border-[#FF3B5C]/30 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[#FF3B5C] font-black text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>Asistencia y Emergencia SOS</span>
          </div>
          <span className="text-[10px] font-bold text-slate-200 bg-[#FF3B5C]/30 px-2 py-0.5 rounded-full border border-[#FF3B5C]/40">
            VEN 911
          </span>
        </div>

        <p className="text-[11px] text-slate-300">
          En caso de incidente en ruta, presiona para compartir tu ubicación GPS en tiempo real con las autoridades venezolanas y tus contactos de confianza.
        </p>

        {sosActive ? (
          <div className="py-2.5 rounded-2xl bg-[#FF3B5C] text-white font-black text-xs text-center animate-pulse">
            🚨 Alerta SOS enviada a VEN 911 con tu ubicación satelital.
          </div>
        ) : (
          <button
            onClick={handleTriggerSos}
            className="w-full py-2.5 rounded-2xl bg-[#FF3B5C] hover:bg-rose-600 text-white font-black text-xs shadow-lg shadow-[#FF3B5C]/25 transition active:scale-95 flex items-center justify-center space-x-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Activar Alerta de Seguridad SOS</span>
          </button>
        )}
      </div>

      {/* 5. Configuración de Operación y Ciudad */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
          Configuración y Ciudad
        </h3>

        <div className="rounded-[26px] bg-[#0D111A] border border-white/[0.08] shadow-md divide-y divide-white/[0.04]">
          {/* Ciudad */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <MapPin className="w-4 h-4 text-[#00E599]" />
              <span className="text-xs font-semibold text-white">Ciudad de Operación</span>
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="p-1.5 rounded-xl bg-black/60 border border-white/15 text-xs font-bold text-[#00E599] focus:outline-none"
            >
              <option value="Caracas">Caracas</option>
              <option value="Valencia">Valencia</option>
              <option value="Maracaibo">Maracaibo</option>
              <option value="Barquisimeto">Barquisimeto</option>
              <option value="Maracay">Maracay</option>
              <option value="Puerto La Cruz">Puerto La Cruz</option>
            </select>
          </div>

          {/* Alertas Sonoras */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Bell className="w-4 h-4 text-[#FFB800]" />
              <div>
                <span className="text-xs font-semibold text-white block">Alertas Sonoras</span>
                <span className="text-[10px] text-slate-400">Sonido de timbre en solicitudes y cobros</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 accent-[#00E599] rounded cursor-pointer"
            />
          </div>

          {/* Vibración Háptica Android */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Smartphone className="w-4 h-4 text-[#00D2FF]" />
              <div>
                <span className="text-xs font-semibold text-white block">Vibración Háptica</span>
                <span className="text-[10px] text-slate-400">Feedback táctil en teléfonos Android</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={vibrationEnabled}
              onChange={(e) => setVibrationEnabled(e.target.checked)}
              className="w-4 h-4 accent-[#00E599] rounded cursor-pointer"
            />
          </div>

          {/* Soporte WhatsApp 24/7 */}
          <a
            href="https://wa.me/584120000000"
            target="_blank"
            rel="noreferrer"
            className="p-3.5 flex items-center justify-between text-slate-200 hover:text-white transition"
          >
            <div className="flex items-center space-x-2.5">
              <MessageSquare className="w-4 h-4 text-[#00E599]" />
              <span className="text-xs font-semibold">Soporte RideX Venezuela (WhatsApp 24/7)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </a>
        </div>
      </div>

      {/* 6. Cambiar de Cuenta / Iniciar Sesión / Cerrar Sesión */}
      <div className="pt-1 space-y-2">
        <button
          onClick={() => {
            triggerHaptic(30);
            onOpenAuthModal();
          }}
          className="w-full py-3 px-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-black text-[#00D2FF] flex items-center justify-center space-x-2 transition active:scale-95"
        >
          <User className="w-4 h-4" />
          <span>Cambiar de Cuenta o Registrar Nuevo Usuario</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full py-3 px-4 rounded-2xl bg-[#FF3B5C]/10 hover:bg-[#FF3B5C]/20 border border-[#FF3B5C]/30 text-xs font-black text-[#FF7088] flex items-center justify-center space-x-2 transition active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
