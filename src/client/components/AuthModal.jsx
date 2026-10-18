import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Car,
  Bike,
  Camera,
  CheckCircle2,
  AlertCircle,
  Lock,
  Phone,
  Mail,
  FileText,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { triggerHaptic } from '../utils/soundEffects.js';
import { DEFAULT_AVATARS } from '../../shared/constants.js';
import {
  getBrandsForVehicleType,
  getModelsForBrand,
  VENEZUELAN_VEHICLE_COLORS,
  VENEZUELAN_VEHICLE_YEARS
} from '../../shared/vehiclesCatalog.js';

export function AuthModal({
  isOpen,
  onClose,
  onSuccessAuth,
  initialTab = 'register', // 'register' | 'login'
  currentRole = 'passenger'
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'register' | 'login'
  const [role, setRole] = useState(currentRole); // 'passenger' | 'driver'

  // Campos de Registro
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [nationalIdPrefix, setNationalIdPrefix] = useState('V');
  const [nationalIdNumber, setNationalIdNumber] = useState('');
  const [city, setCity] = useState('Caracas');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null);

  // Campos del Vehículo si es Conductor
  const [vehicleType, setVehicleType] = useState('moto'); // 'moto' | 'carro_standard' | 'carro_confort'
  const [vehicleMake, setVehicleMake] = useState('Bera');
  const [vehicleModel, setVehicleModel] = useState('Bera SBR 150');
  const [vehicleYear, setVehicleYear] = useState('2024');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleColor, setVehicleColor] = useState('Rojo');
  const [hasAc, setHasAc] = useState(false);

  const handleVehicleTypeChange = (newType) => {
    setVehicleType(newType);
    const brands = getBrandsForVehicleType(newType);
    const defaultBrand = newType === 'moto' ? 'Bera' : 'Chevrolet';
    const brandToSet = brands.includes(defaultBrand) ? defaultBrand : brands[0];
    setVehicleMake(brandToSet);
    const models = getModelsForBrand(brandToSet, newType);
    setVehicleModel(models[0] || '');
    setHasAc(newType === 'carro_confort');
  };

  const handleVehicleMakeChange = (newMake) => {
    setVehicleMake(newMake);
    const models = getModelsForBrand(newMake, vehicleType);
    setVehicleModel(models[0] || '');
  };

  // Campos de Login
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Manejo de carga de foto personalizada con compresión y redimensionamiento
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor seleccione un archivo de imagen válido');
      return;
    }

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

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    triggerHaptic(40);

    if (!name.trim() || !phone.trim() || !password.trim()) {
      setErrorMessage('Nombre, teléfono y contraseña son obligatorios');
      return;
    }

    if (role === 'driver' && !vehiclePlate.trim()) {
      setErrorMessage('Como conductor debes registrar la placa de tu vehículo');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        nationalId: `${nationalIdPrefix}-${nationalIdNumber.trim()}`,
        role,
        city,
        password,
        avatar,
        vehicle: role === 'driver' ? {
          vehicleType,
          make: vehicleMake,
          model: vehicleModel,
          year: vehicleYear,
          plate: vehiclePlate.toUpperCase().trim(),
          color: vehicleColor,
          hasAc: vehicleType === 'carro_confort' ? true : hasAc
        } : null
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al registrar usuario');
      }

      setSuccessMessage('¡Cuenta creada exitosamente en RideX!');
      triggerHaptic(100);

      // Guardar en localStorage
      localStorage.setItem('ridex_token', data.token);
      localStorage.setItem('ridex_user', JSON.stringify(data.user));

      setTimeout(() => {
        onSuccessAuth(data.user, data.token);
        onClose();
      }, 800);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    triggerHaptic(40);

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setErrorMessage('Por favor ingresa tu teléfono/correo y contraseña');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier.trim(),
          password: loginPassword
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Credenciales incorrectas');
      }

      setSuccessMessage(`¡Bienvenido de vuelta, ${data.user.name}!`);
      triggerHaptic(100);

      localStorage.setItem('ridex_token', data.token);
      localStorage.setItem('ridex_user', JSON.stringify(data.user));

      setTimeout(() => {
        onSuccessAuth(data.user, data.token);
        onClose();
      }, 700);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Login Rápido con Cuenta Demo
  const handleQuickDemo = async (demoPhone) => {
    setLoginIdentifier(demoPhone);
    setLoginPassword('123456');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: demoPhone,
          password: '123456'
        })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('ridex_token', data.token);
        localStorage.setItem('ridex_user', JSON.stringify(data.user));
        onSuccessAuth(data.user, data.token);
        onClose();
      }
    } catch (err) {
      setErrorMessage('Error al acceder con demo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in safe-area-pb overflow-y-auto select-none">
      <div className="w-full max-w-md my-auto rounded-[32px] bg-[#0D111A] border border-white/15 p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl text-slate-100 space-y-4 animate-slide-up-drawer">
        {/* Cabecera Modal */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00E599] to-[#00D2FF] flex items-center justify-center font-black text-black text-sm shadow-md">
              RX
            </div>
            <div>
              <h3 className="font-black text-white text-base">Ride<span className="text-[#00E599]">X</span> Cuenta</h3>
              <p className="text-[10px] text-slate-400">Movilidad y Transporte Oficial en Venezuela</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic(30);
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white tap-scale transition-colors duration-140"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selector de Pestañas: Crear Cuenta vs Iniciar Sesión */}
        <div className="p-1 rounded-2xl bg-black/40 border border-white/[0.08] grid grid-cols-2 gap-1 text-xs font-black">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(30);
              setActiveTab('register');
            }}
            className={`py-2 rounded-xl tap-scale transition-colors duration-140 ${
              activeTab === 'register'
                ? 'bg-[#00E599] text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Crear Cuenta (Registro)
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic(30);
              setActiveTab('login');
            }}
            className={`py-2 rounded-xl tap-scale transition-colors duration-140 ${
              activeTab === 'login'
                ? 'bg-[#00E599] text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
        </div>

        {/* Mensajes de Alerta / Éxito */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-pixel-red/15 border border-pixel-red/30 text-pixel-redLight text-xs flex items-center space-x-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-2xl bg-pixel-green/15 border border-pixel-green/30 text-pixel-greenLight text-xs flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* --- FORMULARIO DE REGISTRO --- */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5 text-xs animate-fade-in">
            {/* 1. Selector de Rol (Pasajero o Conductor) */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">¿Cómo usarás RideX?</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(30);
                    setRole('passenger');
                  }}
                  className={`p-2.5 rounded-2xl border flex items-center justify-center space-x-2 transition ${
                    role === 'passenger'
                      ? 'bg-pixel-blue/20 border-pixel-blue text-white font-black'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  <User className="w-4 h-4 text-pixel-blueLight" />
                  <span>Soy Pasajero</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(30);
                    setRole('driver');
                  }}
                  className={`p-2.5 rounded-2xl border flex items-center justify-center space-x-2 transition ${
                    role === 'driver'
                      ? 'bg-pixel-yellow/20 border-pixel-yellow text-white font-black'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  <Car className="w-4 h-4 text-pixel-yellow" />
                  <span>Soy Conductor</span>
                </button>
              </div>
            </div>

            {/* 2. Foto de Perfil con opción de Cámara/Galería o Presets */}
            <div className="p-3 rounded-2xl bg-black/30 border border-white/10 flex items-center space-x-3.5">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-pixel-green/50 overflow-hidden flex items-center justify-center shadow-md">
                  {avatar ? (
                    <img src={avatar} alt="Foto de perfil" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-slate-500" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-pixel-green text-black flex items-center justify-center shadow-lg tap-scale transition-colors duration-140"
                  title="Subir foto desde galería o cámara"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-white text-xs">Foto de Perfil</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Sube tu foto real o elige un avatar venezolano</p>

                {/* Botón selector de archivo */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex space-x-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-[10px] font-bold text-white tap-scale transition-colors duration-140"
                  >
                    Subir Foto
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatar(role === 'driver' ? DEFAULT_AVATARS.driver_moto : DEFAULT_AVATARS.passenger_female)}
                    className="px-2 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-medium text-slate-400"
                  >
                    Avatar 1
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatar(role === 'driver' ? DEFAULT_AVATARS.driver_car : DEFAULT_AVATARS.passenger_male)}
                    className="px-2 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-medium text-slate-400"
                  >
                    Avatar 2
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Datos Personales */}
            <div className="space-y-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Nombre y Apellido</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Daniel Colmenares"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900/90 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-pixel-green"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Teléfono Móvil (0412/0414)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0412-1234567"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900/90 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-pixel-green font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Cédula de Identidad</label>
                  <div className="flex">
                    <select
                      value={nationalIdPrefix}
                      onChange={(e) => setNationalIdPrefix(e.target.value)}
                      className="px-2 py-2.5 rounded-l-2xl bg-slate-800 border border-r-0 border-white/15 text-white font-bold"
                    >
                      <option value="V">V-</option>
                      <option value="E">E-</option>
                    </select>
                    <input
                      type="text"
                      required
                      value={nationalIdNumber}
                      onChange={(e) => setNationalIdNumber(e.target.value)}
                      placeholder="24555666"
                      className="w-full px-2.5 py-2.5 rounded-r-2xl bg-slate-900/90 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-pixel-green font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Ciudad de Operación</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900/90 border border-white/15 text-white focus:outline-none focus:border-pixel-green"
                  >
                    <option value="Caracas">Caracas</option>
                    <option value="Valencia">Valencia</option>
                    <option value="Maracaibo">Maracaibo</option>
                    <option value="Barquisimeto">Barquisimeto</option>
                    <option value="Maracay">Maracay</option>
                    <option value="Puerto La Cruz">Puerto La Cruz</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Contraseña</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900/90 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-pixel-green"
                  />
                </div>
              </div>
            </div>

            {/* 4. Si es Conductor: Datos del Vehículo */}
            {role === 'driver' && (
              <div className="p-3.5 rounded-2xl bg-pixel-yellow/5 border border-pixel-yellow/20 space-y-2.5">
                <span className="font-extrabold text-pixel-yellow text-[11px] flex items-center space-x-1.5">
                  <Car className="w-3.5 h-3.5" />
                  <span>Datos de tu Vehículo</span>
                </span>

                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => handleVehicleTypeChange('moto')}
                    className={`p-2 rounded-xl border text-center transition ${
                      vehicleType === 'moto'
                        ? 'bg-pixel-yellow/20 border-pixel-yellow text-white font-bold'
                        : 'bg-black/30 border-white/10 text-slate-400'
                    }`}
                  >
                    Moto Express
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVehicleTypeChange('carro_standard')}
                    className={`p-2 rounded-xl border text-center transition ${
                      vehicleType === 'carro_standard'
                        ? 'bg-pixel-blue/20 border-pixel-blue text-white font-bold'
                        : 'bg-black/30 border-white/10 text-slate-400'
                    }`}
                  >
                    Carro Estándar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVehicleTypeChange('carro_confort')}
                    className={`p-2 rounded-xl border text-center transition ${
                      vehicleType === 'carro_confort'
                        ? 'bg-pixel-green/20 border-pixel-green text-white font-bold'
                        : 'bg-black/30 border-white/10 text-slate-400'
                    }`}
                  >
                    Confort A/C
                  </button>
                </div>

                {/* Marca y Modelo de Venezuela */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Marca ({vehicleType === 'moto' ? 'Moto' : 'Carro'})</label>
                    <select
                      value={vehicleMake}
                      onChange={(e) => handleVehicleMakeChange(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-pixel-yellow"
                    >
                      {getBrandsForVehicleType(vehicleType).map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Modelo Venezolano</label>
                    <select
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-pixel-yellow"
                    >
                      {getModelsForBrand(vehicleMake, vehicleType).map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Año, Color y Placa */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Año</label>
                    <select
                      value={vehicleYear}
                      onChange={(e) => setVehicleYear(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-semibold focus:outline-none"
                    >
                      {VENEZUELAN_VEHICLE_YEARS.slice(0, 20).map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Color</label>
                    <select
                      value={vehicleColor}
                      onChange={(e) => setVehicleColor(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-semibold focus:outline-none"
                    >
                      {VENEZUELAN_VEHICLE_COLORS.map((color) => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Placa (INTT)</label>
                    <input
                      type="text"
                      required
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                      placeholder={vehicleType === 'moto' ? 'AD712YZ' : 'AC881ZZ'}
                      className="w-full px-2 py-2 rounded-xl bg-slate-900 border border-white/15 text-white font-mono uppercase font-bold text-center text-xs tracking-wider"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Botón de Envío */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pixel-green to-emerald-400 text-black font-black text-sm tracking-wide shadow-xl shadow-pixel-green/30 tap-scale shimmer-button transition-transform duration-140 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Creando tu cuenta en RideX...' : 'Completar Registro Oficial'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* --- FORMULARIO DE INICIO DE SESIÓN --- */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs animate-fade-in">
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Teléfono o Correo Electrónico</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="0412-9876543 o usuario@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-slate-900/90 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-pixel-green"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Contraseña</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-slate-900/90 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-pixel-green"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-pixel-green text-black font-black text-sm tracking-wide shadow-xl shadow-pixel-green/30 tap-scale shimmer-button transition-transform duration-140 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Verificando...' : 'Iniciar Sesión'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Accesos Rápidos Demo para Pruebas Instantáneas */}
            <div className="pt-2 border-t border-white/10 text-center space-y-2">
              <span className="text-[10px] text-slate-400 font-semibold block">O ingresa de inmediato con una cuenta demo:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('0414-2345678')}
                  className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-pixel-blueLight tap-scale transition-colors duration-140"
                >
                  👩 Mariana (Pasajera)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('0412-9876543')}
                  className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-pixel-yellowLight tap-scale transition-colors duration-140"
                >
                  🏍️ Carlos (Conductor)
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
