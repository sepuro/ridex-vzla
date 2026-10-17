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
  Briefcase
} from 'lucide-react';
import { triggerHaptic } from '../utils/soundEffects.js';

export function ProfileView({
  role = 'passenger',
  onToggleRole,
  currentUser,
  onOpenAuthModal,
  onOpenEditProfile,
  onLogout
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
      <div className="p-5 rounded-[28px] bg-[#111622]/90 backdrop-blur-2xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.4)] space-y-4">
        <div className="flex items-center space-x-4">
          {/* Avatar con Botón de Edición Rápida */}
          <div className="relative flex-shrink-0">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-[24px] bg-slate-800 border-2 border-pixel-greenLight/60 overflow-hidden flex items-center justify-center shadow-lg shadow-pixel-green/20">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-pixel-green to-emerald-400 flex items-center justify-center font-black text-black text-2xl">
                  {displayName.charAt(0)}
                </div>
              )}
            </div>
            <button
              onClick={onOpenEditProfile}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-pixel-green text-black flex items-center justify-center shadow-md active:scale-90 transition border border-white"
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
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-pixel-green/20 text-pixel-greenLight border border-pixel-greenLight/30 flex-shrink-0">
                ✓ Verificado
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-0.5 font-mono truncate">
              {displayPhone} • {displayNationalId}
            </p>

            <div className="flex items-center space-x-2.5 mt-1.5 text-xs">
              <span className="font-extrabold text-pixel-yellow flex items-center">
                <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                {displayRating}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 font-semibold">{displayRides} carreras completadas</span>
            </div>
          </div>
        </div>

        {/* Botones Rápidos: Editar Perfil + Cambiar Rol */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
          <button
            onClick={onOpenEditProfile}
            className="py-2.5 px-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center justify-center space-x-1.5 transition active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5 text-pixel-blueLight" />
            <span>Editar Datos</span>
          </button>

          <button
            onClick={onToggleRole}
            className={`py-2.5 px-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center space-x-1.5 transition active:scale-95 ${
              role === 'driver'
                ? 'bg-pixel-yellow/20 border-pixel-yellow/40 text-pixel-yellow'
                : 'bg-pixel-green/20 border-pixel-green/40 text-pixel-greenLight'
            }`}
          >
            {role === 'driver' ? <Car className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            <span>Modo {role === 'driver' ? 'Pasajero' : 'Conductor'}</span>
          </button>
        </div>
      </div>

      {/* 2. Si es Conductor: Tarjeta del Vehículo y Documentos Legales Venezolanos */}
      {role === 'driver' && (
        <div className="space-y-2">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
            Vehículo Registrado y Documentación
          </h3>

          <div className="p-4 rounded-[26px] bg-[#111622]/90 backdrop-blur-xl border border-white/15 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-pixel-yellow/15 border border-pixel-yellow/30 flex items-center justify-center text-pixel-yellow">
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
                    Placa: <strong className="text-white">{currentUser?.vehicle?.plate || 'AD712YZ'}</strong> • Color: {currentUser?.vehicle?.color || 'Rojo'}
                  </p>
                </div>
              </div>

              {currentUser?.vehicle?.hasAc && (
                <span className="px-2 py-0.5 rounded-full bg-pixel-green/20 text-pixel-greenLight text-[10px] font-black border border-pixel-green/30">
                  ❄️ A/C Full
                </span>
              )}
            </div>

            {/* Checklist de Documentos INTT */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[11px]">
              <div className="flex items-center space-x-1.5 text-slate-300">
                <FileCheck className="w-4 h-4 text-pixel-greenLight" />
                <span>Licencia: <strong className="text-white">Vigente INTT</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-300">
                <FileCheck className="w-4 h-4 text-pixel-greenLight" />
                <span>Seguro RCV: <strong className="text-white">Activo</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-300">
                <FileCheck className="w-4 h-4 text-pixel-greenLight" />
                <span>Certif. Médico: <strong className="text-white">Aprobado</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-300">
                <FileCheck className="w-4 h-4 text-pixel-greenLight" />
                <span>Carnet Circulación: <strong className="text-white">Al día</strong></span>
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
          <div className="p-3 rounded-2xl bg-[#111622]/80 border border-white/10 flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-pixel-blue/15 text-pixel-blueLight flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Casa</span>
              <p className="text-xs font-semibold text-white truncate">Altamira, Chacao</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#111622]/80 border border-white/10 flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-pixel-yellow/15 text-pixel-yellow flex items-center justify-center">
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
      <div className="p-4 rounded-[26px] bg-red-950/30 border border-pixel-red/40 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-pixel-red font-black text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>Asistencia y Emergencia SOS</span>
          </div>
          <span className="text-[10px] font-bold text-slate-300 bg-red-900/50 px-2 py-0.5 rounded-full border border-red-500/30">
            VEN 911
          </span>
        </div>

        <p className="text-[11px] text-slate-300">
          En caso de incidente en ruta, presiona para compartir tu ubicación GPS en tiempo real con las autoridades venezolanas y tus contactos de confianza.
        </p>

        {sosActive ? (
          <div className="py-2.5 rounded-2xl bg-pixel-red text-white font-black text-xs text-center animate-pulse">
            🚨 Alerta SOS enviada a VEN 911 con tu ubicación satelital.
          </div>
        ) : (
          <button
            onClick={handleTriggerSos}
            className="w-full py-2.5 rounded-2xl bg-pixel-red hover:bg-red-600 text-white font-extrabold text-xs shadow-lg shadow-red-500/25 transition active:scale-95 flex items-center justify-center space-x-2"
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

        <div className="rounded-[26px] bg-[#111622]/90 border border-white/10 shadow-md divide-y divide-white/5">
          {/* Ciudad */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <MapPin className="w-4 h-4 text-pixel-greenLight" />
              <span className="text-xs font-semibold text-white">Ciudad de Operación</span>
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="p-1.5 rounded-xl bg-slate-900 border border-white/15 text-xs font-bold text-pixel-greenLight focus:outline-none"
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
              <Bell className="w-4 h-4 text-pixel-yellow" />
              <div>
                <span className="text-xs font-semibold text-white block">Alertas Sonoras</span>
                <span className="text-[10px] text-slate-400">Sonido de timbre en solicitudes y cobros</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 accent-pixel-green rounded cursor-pointer"
            />
          </div>

          {/* Vibración Háptica Android */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Smartphone className="w-4 h-4 text-pixel-blueLight" />
              <div>
                <span className="text-xs font-semibold text-white block">Vibración Háptica</span>
                <span className="text-[10px] text-slate-400">Feedback táctil en teléfonos Android</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={vibrationEnabled}
              onChange={(e) => setVibrationEnabled(e.target.checked)}
              className="w-4 h-4 accent-pixel-green rounded cursor-pointer"
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
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold">Soporte RideX Venezuela (WhatsApp 24/7)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </a>
        </div>
      </div>

      {/* 6. Cambiar de Cuenta / Iniciar Sesión / Cerrar Sesión */}
      <div className="pt-1 space-y-2">
        <button
          onClick={onOpenAuthModal}
          className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-extrabold text-pixel-blueLight flex items-center justify-center space-x-2 transition active:scale-98"
        >
          <User className="w-4 h-4" />
          <span>Cambiar de Cuenta o Registrar Nuevo Usuario</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full py-3 px-4 rounded-2xl bg-pixel-red/10 hover:bg-pixel-red/20 border border-pixel-red/30 text-xs font-extrabold text-pixel-redLight flex items-center justify-center space-x-2 transition active:scale-98"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
