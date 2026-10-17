import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  CheckCircle2,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  HeartHandshake,
  Save
} from 'lucide-react';
import { triggerHaptic } from '../utils/soundEffects.js';
import { DEFAULT_AVATARS } from '../../shared/constants.js';

export function EditProfileModal({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated
}) {
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [city, setCity] = useState(currentUser?.city || 'Caracas');
  const [avatar, setAvatar] = useState(currentUser?.avatar || null);

  // Vehículo (si es conductor)
  const [vehicleModel, setVehicleModel] = useState(currentUser?.vehicle?.model || 'Bera SBR 150');
  const [vehiclePlate, setVehiclePlate] = useState(currentUser?.vehicle?.plate || 'AC881ZZ');
  const [vehicleColor, setVehicleColor] = useState(currentUser?.vehicle?.color || 'Rojo');
  const [hasAc, setHasAc] = useState(currentUser?.vehicle?.hasAc || false);

  // Contacto de Emergencia
  const [emergencyName, setEmergencyName] = useState(currentUser?.emergencyContact?.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(currentUser?.emergencyContact?.phone || '');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  if (!isOpen || !currentUser) return null;

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 320;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setAvatar(dataUrl);
        triggerHaptic(50);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    triggerHaptic(40);

    const token = localStorage.getItem('ridex_token');

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        city,
        avatar,
        emergencyContact: {
          name: emergencyName.trim(),
          phone: emergencyPhone.trim(),
          relationship: 'Familiar'
        },
        vehicle: currentUser.role === 'driver' ? {
          ...currentUser.vehicle,
          model: vehicleModel.trim(),
          plate: vehiclePlate.toUpperCase().trim(),
          color: vehicleColor.trim(),
          hasAc
        } : null
      };

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error actualizando perfil');
      }

      setMessage('¡Perfil actualizado con éxito!');
      triggerHaptic(80);
      localStorage.setItem('ridex_user', JSON.stringify(data.user));

      setTimeout(() => {
        onProfileUpdated(data.user);
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in safe-area-pb overflow-y-auto">
      <div className="w-full max-w-md my-auto rounded-[32px] bg-[#0d121c]/95 border border-white/15 p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl text-slate-100 space-y-4">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-pixel-greenLight" />
            <h3 className="font-extrabold text-white text-base">Editar Perfil</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-2xl bg-pixel-red/15 border border-pixel-red/30 text-pixel-redLight text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-2.5 rounded-2xl bg-pixel-green/15 border border-pixel-green/30 text-pixel-greenLight text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Foto de Perfil */}
          <div className="flex items-center space-x-4 p-3 rounded-2xl bg-black/30 border border-white/10">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-pixel-green/50 overflow-hidden flex items-center justify-center shadow-md">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-pixel-green text-black flex items-center justify-center shadow-lg active:scale-90"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-xs">Cambiar Foto</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
              <div className="flex space-x-1.5 mt-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-[10px] font-bold text-white transition active:scale-95"
                >
                  Galería / Cámara
                </button>
                <button
                  type="button"
                  onClick={() => setAvatar(currentUser.role === 'driver' ? DEFAULT_AVATARS.driver_moto : DEFAULT_AVATARS.passenger_female)}
                  className="px-2 py-1 rounded-xl bg-white/5 text-[10px] text-slate-400"
                >
                  Preset 1
                </button>
                <button
                  type="button"
                  onClick={() => setAvatar(currentUser.role === 'driver' ? DEFAULT_AVATARS.driver_car : DEFAULT_AVATARS.passenger_male)}
                  className="px-2 py-1 rounded-xl bg-white/5 text-[10px] text-slate-400"
                >
                  Preset 2
                </button>
              </div>
            </div>
          </div>

          {/* Nombre y Teléfono */}
          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Nombre y Apellido</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white focus:outline-none focus:border-pixel-green"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Teléfono de Contacto</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Ciudad</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white focus:outline-none"
                >
                  <option value="Caracas">Caracas</option>
                  <option value="Valencia">Valencia</option>
                  <option value="Maracaibo">Maracaibo</option>
                  <option value="Barquisimeto">Barquisimeto</option>
                  <option value="Maracay">Maracay</option>
                  <option value="Puerto La Cruz">Puerto La Cruz</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vehículo (si es conductor) */}
          {currentUser.role === 'driver' && (
            <div className="p-3 rounded-2xl bg-pixel-yellow/5 border border-pixel-yellow/20 space-y-2">
              <span className="font-bold text-pixel-yellow text-[11px] flex items-center space-x-1">
                <Car className="w-3.5 h-3.5" />
                <span>Datos del Vehículo</span>
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Modelo</label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/15 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Placa</label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/15 text-white font-mono uppercase font-bold text-center"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contacto de Emergencia para SOS */}
          <div className="p-3 rounded-2xl bg-red-950/20 border border-red-500/20 space-y-2">
            <span className="font-bold text-red-400 text-[11px] flex items-center space-x-1">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Contacto de Seguridad (Para SOS VEN 911)</span>
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Nombre Familiar</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Ej: Mamá / Hermano"
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/15 text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Teléfono</label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="0414-0000000"
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/15 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-pixel-green hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg active:scale-98 transition flex items-center justify-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
