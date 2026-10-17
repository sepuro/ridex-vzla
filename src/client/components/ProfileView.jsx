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
  HelpCircle
} from 'lucide-react';
import { triggerHaptic } from '../utils/soundEffects.js';

export function ProfileView({
  role = 'passenger',
  onToggleRole,
  driverProfile
}) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [selectedCity, setSelectedCity] = useState('Caracas');
  const [sosActive, setSosActive] = useState(false);

  const handleTriggerSos = () => {
    triggerHaptic([300, 100, 300, 100, 500]);
    setSosActive(true);
    setTimeout(() => setSosActive(false), 5000);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-16">
      {/* Tarjeta de Perfil */}
      <div className="p-5 rounded-3xl bg-cardBg border border-borderCol shadow-2xl space-y-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accentGreen to-emerald-400 flex items-center justify-center text-black font-black text-2xl shadow-lg shadow-accentGreen/20">
            {role === 'driver' ? driverProfile?.name?.charAt(0) || 'C' : 'P'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-white text-base truncate">
                {role === 'driver' ? driverProfile?.name || 'Carlos Mendoza' : 'Pasajero RideX'}
              </h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-accentGreen/20 text-accentGreen border border-accentGreen/30">
                Verificado
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">{driverProfile?.phone || '0412-9876543'} • V-24.888.999</p>
            <div className="flex items-center space-x-3 mt-1.5 text-xs text-slate-300">
              <span className="font-bold text-accentYellow flex items-center">
                ★ {driverProfile?.rating || '4.97'}
              </span>
              <span>•</span>
              <span className="text-slate-400">{role === 'driver' ? '184 carreras' : '32 viajes'}</span>
            </div>
          </div>
        </div>

        {/* Switch de Rol */}
        <button
          onClick={onToggleRole}
          className="w-full py-2.5 px-4 rounded-2xl bg-surfaceBg hover:bg-surfaceBg/80 border border-borderCol text-xs font-bold text-slate-200 flex items-center justify-between transition active:scale-98"
        >
          <span>Modo Actual: <strong className="text-white capitalize">{role === 'driver' ? 'Conductor' : 'Pasajero'}</strong></span>
          <span className="text-accentGreen text-[11px] font-extrabold">Cambiar a {role === 'driver' ? 'Pasajero' : 'Conductor'} →</span>
        </button>
      </div>

      {/* Si es Conductor: Datos del Vehículo y Documentación */}
      {role === 'driver' && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Vehículo Registrado y Documentos
          </h3>

          <div className="p-4 rounded-3xl bg-cardBg border border-borderCol shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-surfaceBg border border-borderCol flex items-center justify-center text-accentYellow">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">{driverProfile?.model || 'Empire Keeway Express 150'}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">Placa: {driverProfile?.plate || 'AC881ZZ'} • Color: {driverProfile?.color || 'Azul'}</p>
                </div>
              </div>
            </div>

            {/* Documentos Legales Venezolanos */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-borderCol/60 text-xs">
              <div className="flex items-center space-x-1.5 text-slate-300">
                <FileCheck className="w-4 h-4 text-accentGreen" />
                <span>Licencia: <strong>Vigente</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-300">
                <FileCheck className="w-4 h-4 text-accentGreen" />
                <span>Seguro RCV: <strong>Activo</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-300">
                <FileCheck className="w-4 h-4 text-accentGreen" />
                <span>Certif. Médico: <strong>Aprobado</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-300">
                <FileCheck className="w-4 h-4 text-accentGreen" />
                <span>Carnet Circulación: <strong>Al día</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botón de Asistencia / SOS en Ruta */}
      <div className="p-4 rounded-3xl bg-red-950/30 border border-dangerRed/40 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-dangerRed font-black text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>Botón de Emergencia y Asistencia</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400">VEN 911</span>
        </div>

        <p className="text-xs text-slate-300">
          En caso de incidente en ruta, presiona para compartir tu ubicación en tiempo real con las autoridades y contactos de confianza.
        </p>

        {sosActive ? (
          <div className="py-2.5 rounded-2xl bg-dangerRed text-white font-black text-xs text-center animate-pulse">
            🚨 Alerta SOS enviada a VEN 911 con tu ubicación GPS actual.
          </div>
        ) : (
          <button
            onClick={handleTriggerSos}
            className="w-full py-2.5 rounded-2xl bg-dangerRed hover:bg-red-600 text-white font-extrabold text-xs shadow-lg shadow-red-500/25 transition active:scale-95 flex items-center justify-center space-x-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Activar Alerta de Seguridad SOS</span>
          </button>
        )}
      </div>

      {/* Ajustes y Preferencias */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Configuración y Ciudad
        </h3>

        <div className="rounded-3xl bg-cardBg border border-borderCol shadow-md divide-y divide-borderCol/60">
          {/* Ciudad de Operación */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <MapPin className="w-4 h-4 text-accentGreen" />
              <span className="text-xs font-semibold text-white">Ciudad de Operación</span>
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="p-1.5 rounded-xl bg-surfaceBg border border-borderCol text-xs font-bold text-accentGreen focus:outline-none"
            >
              <option value="Caracas">Caracas</option>
              <option value="Valencia">Valencia</option>
              <option value="Maracaibo">Maracaibo</option>
              <option value="Barquisimeto">Barquisimeto</option>
            </select>
          </div>

          {/* Alertas Sonoras */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Bell className="w-4 h-4 text-accentYellow" />
              <div>
                <span className="text-xs font-semibold text-white block">Alertas Sonoras</span>
                <span className="text-[10px] text-slate-400">Sonido al recibir o aceptar carreras</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 accent-accentGreen rounded"
            />
          </div>

          {/* Vibración Háptica */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Smartphone className="w-4 h-4 text-sky-400" />
              <div>
                <span className="text-xs font-semibold text-white block">Vibración Háptica</span>
                <span className="text-[10px] text-slate-400">Feedback táctil en teléfonos Android</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={vibrationEnabled}
              onChange={(e) => setVibrationEnabled(e.target.checked)}
              className="w-4 h-4 accent-accentGreen rounded"
            />
          </div>

          {/* Soporte WhatsApp */}
          <a
            href="https://wa.me/584120000000"
            target="_blank"
            rel="noreferrer"
            className="p-3.5 flex items-center justify-between text-slate-200 hover:text-white"
          >
            <div className="flex items-center space-x-2.5">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold">Soporte RideX Venezuela (WhatsApp 24/7)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </a>
        </div>
      </div>
    </div>
  );
}
