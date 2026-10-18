import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  ArrowUpDown,
  Navigation,
  Sparkles,
  Bike,
  Car,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Search,
  Package,
  Crown
} from 'lucide-react';
import { Header } from './components/Header.jsx';
import { MapView } from './components/MapView.jsx';
import { VehicleSelector } from './components/VehicleSelector.jsx';
import { DeliverySelector } from './components/DeliverySelector.jsx';
import { RideStatusCard } from './components/RideStatusCard.jsx';
import { DriverDashboard } from './components/DriverDashboard.jsx';
import { RateSettingsModal } from './components/RateSettingsModal.jsx';
import { PaymentModal } from './components/PaymentModal.jsx';
import { BottomNav } from './components/BottomNav.jsx';
import { SearchLocationModal } from './components/SearchLocationModal.jsx';
import { ActivityView } from './components/ActivityView.jsx';
import { WalletView } from './components/WalletView.jsx';
import { ProfileView } from './components/ProfileView.jsx';
import { ReceiptModal } from './components/ReceiptModal.jsx';
import { AuthModal } from './components/AuthModal.jsx';
import { EditProfileModal } from './components/EditProfileModal.jsx';
import { SubscriptionModal } from './components/SubscriptionModal.jsx';
import { SplashScreen } from './components/SplashScreen.jsx';
import { PushNotificationToast } from './components/PushNotificationToast.jsx';
import { sendPushNotification } from './utils/notifications.js';
import { useGeolocation } from './hooks/useGeolocation.js';
import { useRideSocket } from './hooks/useRideSocket.js';
import { calculateDistance, calculateFare } from './utils/pricing.js';
import { formatUsd, formatBs, formatDistance, formatDuration } from './utils/formatters.js';
import {
  playNotificationChime,
  playAcceptChime,
  playArrivalChime,
  triggerHaptic
} from './utils/soundEffects.js';
import {
  RIDE_STATUS,
  VEHICLE_TYPES,
  SERVICE_MODES,
  DEFAULT_BCV_RATE,
  POPULAR_LOCATIONS
} from '../shared/constants.js';

export default function App() {
  // --- Navegación por Pestañas ---
  const [activeTab, setActiveTab] = useState('rides'); // 'rides' | 'activity' | 'wallet' | 'profile'

  // --- Estados de Rol y Moneda ---
  const [role, setRole] = useState('passenger'); // 'passenger' | 'driver'
  const [bcvRate, setBcvRate] = useState(DEFAULT_BCV_RATE);
  const [rateSource, setRateSource] = useState('BCV Oficial');
  const [lastUpdatedRate, setLastUpdatedRate] = useState(null);
  const [officialDate, setOfficialDate] = useState(new Date().toISOString().split('T')[0]);
  const [changePercent, setChangePercent] = useState(0.0);
  const [isLiveBcv, setIsLiveBcv] = useState(true);

  // Cargar tasa BCV oficial en vivo al montar la app
  useEffect(() => {
    fetch('/api/bcv')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.rate) {
          setBcvRate(data.rate);
          setRateSource(data.source || 'BCV Oficial');
          setLastUpdatedRate(data.lastUpdated);
          if (data.officialDate) setOfficialDate(data.officialDate);
          if (data.changePercent !== undefined) setChangePercent(data.changePercent);
          if (data.isLive !== undefined) setIsLiveBcv(data.isLive);
        }
      })
      .catch((e) => console.log('[BCV] Fallback local inicial:', e));
  }, []);

  // --- Animación de Inicio (Splash Screen) ---
  const [showSplash, setShowSplash] = useState(true);

  // --- Modales ---
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchModalTarget, setSearchModalTarget] = useState('dropoff'); // 'pickup' | 'dropoff'
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedRideForReceipt, setSelectedRideForReceipt] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // --- Modo de Servicio (Viajes vs Envíos Delivery) ---
  const [serviceMode, setServiceMode] = useState(SERVICE_MODES.RIDES); // 'rides' | 'delivery'

  // --- Estados de Delivery / Encomiendas ---
  const [deliveryVehicleType, setDeliveryVehicleType] = useState(VEHICLE_TYPES.DELIVERY_MOTO);
  const [packageCategory, setPackageCategory] = useState('parcel');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [deliveryPin, setDeliveryPin] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());

  // --- Usuario Autenticado y Perfil ---
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ridex_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      id: 'usr_demo_mariana',
      name: 'Mariana Silva',
      phone: '0414-2345678',
      email: 'mariana.silva@gmail.com',
      nationalId: 'V-26.112.334',
      role: 'passenger',
      city: 'Caracas',
      rating: 4.98,
      totalRides: 42,
      avatar: null,
      vehicle: null,
      isVip: false
    };
  });

  // --- Estados de Ubicación y Ruteo ---
  const { coords: gpsCoords, requestLocation } = useGeolocation();
  const [pickup, setPickup] = useState(POPULAR_LOCATIONS[0]); // Plaza Venezuela
  const [dropoff, setDropoff] = useState(POPULAR_LOCATIONS[1]); // Plaza Altamira
  const [selectingMapMode, setSelectingMapMode] = useState('dropoff'); // 'pickup' | 'dropoff'
  const [streetRoute, setStreetRoute] = useState(null);

  // --- Estados del Pasajero ---
  const [selectedVehicleType, setSelectedVehicleType] = useState(VEHICLE_TYPES.MOTO);
  const [activeRide, setActiveRide] = useState(null);

  // --- Estados del Conductor ---
  const [isDriverOnline, setIsDriverOnline] = useState(true);
  const [driverProfile, setDriverProfile] = useState(() => ({
    driverId: 'drv_demo_carlos',
    name: 'Carlos Mendoza',
    phone: '0412-9876543',
    vehicleType: VEHICLE_TYPES.MOTO,
    plate: 'AD712YZ',
    model: 'Bera SBR 150',
    color: 'Rojo',
    rating: 4.97
  }));
  const [driverIncomingOffer, setDriverIncomingOffer] = useState(null);

  // Distancia real de calle o aproximada
  const directDistanceKm = calculateDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
  const effectiveDistanceKm = streetRoute?.distanceKm || directDistanceKm;
  const activeVehicleType = serviceMode === SERVICE_MODES.DELIVERY ? deliveryVehicleType : selectedVehicleType;
  const currentFare = calculateFare({
    distanceKm: effectiveDistanceKm,
    vehicleType: activeVehicleType,
    bcvRate,
    isVip: Boolean(currentUser?.isVip)
  });

  // --- WebSocket Eventos en Tiempo Real ---
  const handleSocketEvent = useCallback((event, data) => {
    switch (event) {
      case 'bcv:current':
      case 'bcv:updated': {
        if (data.rate) {
          setBcvRate(data.rate);
          setRateSource(data.source || 'BCV Oficial');
          setLastUpdatedRate(data.lastUpdated);
          if (data.officialDate) setOfficialDate(data.officialDate);
          if (data.changePercent !== undefined) setChangePercent(data.changePercent);
          if (data.isLive !== undefined) setIsLiveBcv(data.isLive);
        }
        break;
      }

      case 'ride:created': {
        setActiveRide(data);
        triggerHaptic(80);
        break;
      }

      case 'ride:new_offer': {
        setDriverIncomingOffer(data);
        sendPushNotification({
          title: '🔔 ¡Nueva Carrera Solicitada!',
          body: `Ganancia: $${data.fareUsd?.toFixed(2)} (Bs. ${data.fareBs?.toFixed(2)}) • ${data.distanceKm || 3.5} km • Recogida: ${data.pickup?.name?.split(',')[0] || 'Caracas'}`,
          type: 'ride_offer',
          data
        });
        break;
      }

      case 'ride:accepted':
      case 'ride:assigned': {
        setActiveRide(data);
        setDriverIncomingOffer(null);
        sendPushNotification({
          title: '🚗 ¡Conductor Asignado!',
          body: `${data.driver?.name || 'Tu conductor'} va en camino en su ${data.driver?.model || 'Vehículo'} (${data.driver?.plate || 'Placa asignada'}).`,
          type: 'ride_assigned',
          data
        });
        break;
      }

      case 'ride:taken': {
        if (driverIncomingOffer && driverIncomingOffer.id === data.rideId) {
          setDriverIncomingOffer(null);
        }
        break;
      }

      case 'driver:location_update': {
        if (activeRide && activeRide.id === data.rideId) {
          setActiveRide((prev) => prev ? {
            ...prev,
            driver: {
              ...prev.driver,
              location: data.location
            }
          } : null);
        }
        break;
      }

      case 'ride:status_changed': {
        setActiveRide((prev) => prev ? { ...prev, status: data.status } : data);
        if (data.status === RIDE_STATUS.ARRIVED) {
          sendPushNotification({
            title: '📍 ¡Tu Conductor Ha Llegado!',
            body: 'El vehículo te espera en el punto de recogida seleccionado.',
            type: 'driver_arrived',
            data
          });
        } else if (data.status === RIDE_STATUS.IN_PROGRESS) {
          sendPushNotification({
            title: '🛡️ ¡Viaje en Curso!',
            body: 'Monitoreo GPS RideX activado hacia tu destino.',
            type: 'info',
            data
          });
        } else {
          triggerHaptic(120);
        }
        break;
      }

      case 'ride:payment_submitted':
      case 'ride:payment_pending_confirmation': {
        setActiveRide(data);
        sendPushNotification({
          title: '💳 Comprobante Recibido',
          body: 'Verificando liquidación de Pago Móvil...',
          type: 'wallet',
          data
        });
        break;
      }

      case 'ride:completed_and_paid': {
        setActiveRide(data);
        sendPushNotification({
          title: '✅ ¡Viaje Liquidado y Completado!',
          body: `Monto: $${data.fareUsd?.toFixed(2)} (Bs. ${data.fareBs?.toFixed(2)}). Tu recibo digital está listo.`,
          type: 'ride_completed',
          data
        });
        setSelectedRideForReceipt(data);
        setReceiptModalOpen(true);
        break;
      }

      case 'ride:cancelled': {
        setActiveRide(null);
        setDriverIncomingOffer(null);
        sendPushNotification({
          title: '⚠️ Viaje Cancelado',
          body: 'La carrera fue cancelada.',
          type: 'info'
        });
        break;
      }

      default:
        break;
    }
  }, [activeRide, driverIncomingOffer]);

  const { connected, sendEvent } = useRideSocket({
    role,
    meta: role === 'driver' ? driverProfile : { name: 'Pasajero Android' },
    onEvent: handleSocketEvent
  });

  // Cargar tasa BCV al inicio
  useEffect(() => {
    fetch('/api/bcv')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.rate) {
          setBcvRate(data.rate);
          setRateSource(data.source);
          setLastUpdatedRate(data.lastUpdated);
        }
      })
      .catch((err) => console.log('BCV init:', err.message));
  }, []);

  const handleSuccessAuth = (user, token) => {
    setCurrentUser(user);
    setRole(user.role);
    if (user.role === 'driver') {
      setDriverProfile({
        driverId: user.id,
        name: user.name,
        phone: user.phone,
        vehicleType: user.vehicle?.vehicleType || VEHICLE_TYPES.MOTO,
        plate: user.vehicle?.plate || 'AC881ZZ',
        model: user.vehicle?.model || 'Bera SBR 150',
        color: user.vehicle?.color || 'Rojo',
        rating: user.rating || 5.0
      });
      sendEvent('client:init', {
        role: 'driver',
        meta: {
          driverId: user.id,
          name: user.name,
          phone: user.phone,
          vehicleType: user.vehicle?.vehicleType || VEHICLE_TYPES.MOTO,
          plate: user.vehicle?.plate || 'AC881ZZ'
        }
      });
    } else {
      sendEvent('client:init', {
        role: 'passenger',
        meta: { name: user.name, phone: user.phone }
      });
    }
    triggerHaptic(80);
  };

  const handleProfileUpdated = (updatedUser) => {
    setCurrentUser(updatedUser);
    if (updatedUser.role === 'driver') {
      setDriverProfile((prev) => ({
        ...prev,
        name: updatedUser.name,
        phone: updatedUser.phone,
        model: updatedUser.vehicle?.model || prev.model,
        plate: updatedUser.vehicle?.plate || prev.plate,
        color: updatedUser.vehicle?.color || prev.color,
        vehicleType: updatedUser.vehicle?.vehicleType || prev.vehicleType
      }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ridex_token');
    localStorage.removeItem('ridex_user');
    setCurrentUser(null);
    setIsAuthModalOpen(true);
    triggerHaptic(60);
  };

  const handleToggleRole = () => {
    const nextRole = role === 'passenger' ? 'driver' : 'passenger';
    setRole(nextRole);
    sendEvent('client:init', {
      role: nextRole,
      meta: nextRole === 'driver' ? driverProfile : { name: currentUser?.name || 'Pasajero Android' }
    });
    triggerHaptic(60);
  };

  // Pasajero
  const handleRequestRide = () => {
    if (!connected) {
      alert('Conectando con el servidor RideX... Intenta de nuevo en 2 segundos.');
      return;
    }

    if (serviceMode === SERVICE_MODES.DELIVERY) {
      if (!receiverName.trim()) {
        alert('Por favor ingresa el nombre de la persona que recibirá la encomienda.');
        return;
      }
      if (!receiverPhone.trim()) {
        alert('Por favor ingresa el teléfono celular del destinatario.');
        return;
      }
    }

    const packageDetails = serviceMode === SERVICE_MODES.DELIVERY ? {
      category: packageCategory,
      receiverName: receiverName.trim(),
      receiverPhone: receiverPhone.trim(),
      notes: deliveryNotes.trim(),
      deliveryPin
    } : null;

    sendEvent('passenger:request_ride', {
      pickup,
      dropoff,
      vehicleType: activeVehicleType,
      fareUsd: currentFare.fareUsd,
      fareBs: currentFare.fareBs,
      bcvRate,
      distanceKm: effectiveDistanceKm,
      estimatedMinutes: streetRoute?.durationMin || currentFare.estimatedMinutes,
      serviceMode,
      packageDetails,
      isVip: Boolean(currentUser?.isVip)
    });
  };

  const handleCancelRide = (rideId) => {
    sendEvent('ride:cancel', { rideId, reason: 'Cancelado por el usuario' });
    setActiveRide(null);
  };

  const handleSubmitPayment = (paymentData) => {
    if (!activeRide) return;
    sendEvent('passenger:submit_payment', {
      rideId: activeRide.id,
      payment: paymentData
    });
  };

  // Conductor
  const handleToggleDriverOnline = () => {
    const nextStatus = !isDriverOnline;
    setIsDriverOnline(nextStatus);
    sendEvent('driver:set_online', {
      driverId: driverProfile.driverId,
      isOnline: nextStatus
    });
    triggerHaptic(80);
  };

  const handleAcceptOffer = (rideId) => {
    sendEvent('driver:accept_ride', {
      rideId,
      driverId: driverProfile.driverId
    });
  };

  const handleRejectOffer = () => {
    setDriverIncomingOffer(null);
  };

  const handleUpdateRideStatus = (rideId, status) => {
    sendEvent('ride:update_status', { rideId, status });
  };

  const handleConfirmPayment = (rideId) => {
    sendEvent('driver:confirm_payment', {
      rideId,
      driverId: driverProfile.driverId
    });
  };

  const handleSwapLocations = () => {
    setPickup(dropoff);
    setDropoff(pickup);
    triggerHaptic(50);
  };

  const handleCenterUser = () => {
    requestLocation();
    if (gpsCoords) {
      if (selectingMapMode === 'pickup') {
        setPickup({ ...gpsCoords, name: 'Mi ubicación actual (GPS)' });
      } else {
        setDropoff({ ...gpsCoords, name: 'Destino fijado (GPS)' });
      }
    }
  };

  const handleOpenSearchModal = (target = 'dropoff') => {
    setSearchModalTarget(target);
    setSearchModalOpen(true);
  };

  const handleSelectLocationFromSearch = (location) => {
    if (searchModalTarget === 'pickup') {
      setPickup(location);
    } else {
      setDropoff(location);
    }
  };

  const handleReorderRide = (ride) => {
    if (ride?.pickup && ride?.dropoff) {
      setPickup(ride.pickup);
      setDropoff(ride.dropoff);
      if (ride.vehicleType) {
        setSelectedVehicleType(ride.vehicleType);
      }
      setActiveTab('rides');
      triggerHaptic(80);
    }
  };


  const handleUpdateRate = async (newRate) => {
    try {
      const res = await fetch('/api/bcv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate: newRate })
      });
      const data = await res.json();
      if (data && data.rate) {
        setBcvRate(data.rate);
        setRateSource(data.source || 'Ajuste manual');
        setLastUpdatedRate(data.lastUpdated);
        if (data.changePercent !== undefined) setChangePercent(data.changePercent);
      }
    } catch (err) {
      console.error('Error guardando tasa:', err);
    }
  };

  const handleRefreshLiveBcv = async () => {
    const res = await fetch('/api/bcv/refresh', { method: 'POST' });
    const data = await res.json();
    if (data && data.rate) {
      setBcvRate(data.rate);
      setRateSource(data.source || 'BCV Oficial');
      setLastUpdatedRate(data.lastUpdated);
      if (data.officialDate) setOfficialDate(data.officialDate);
      if (data.changePercent !== undefined) setChangePercent(data.changePercent);
      if (data.isLive !== undefined) setIsLiveBcv(data.isLive);
    }
    return data;
  };

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 flex flex-col max-w-md mx-auto relative shadow-2xl overflow-x-hidden safe-area-pt">
      {/* Sistema de Notificaciones Push Flotante tipo Dynamic Island */}
      <PushNotificationToast
        onNotificationClick={(notif) => {
          if (notif.type === 'ride_offer' || notif.type === 'ride_assigned' || notif.type === 'driver_arrived') {
            setActiveTab('rides');
          } else if (notif.type === 'wallet') {
            setActiveTab('wallet');
          }
        }}
      />

      {/* 1. Header con switch de rol y tasa BCV en vivo */}
      <Header
        role={role}
        onToggleRole={handleToggleRole}
        bcvRate={bcvRate}
        onOpenRateModal={() => setIsRateModalOpen(true)}
        connected={connected}
        rateSource={rateSource}
        isLiveBcv={isLiveBcv}
        isVip={Boolean(currentUser?.isVip)}
        onOpenVipModal={() => setIsSubscriptionModalOpen(true)}
      />

      {/* 2. Contenido según la pestaña activa */}
      {activeTab === 'rides' && (
        <div className="flex flex-col flex-1 pb-20">
          {/* Mapa Interactivo con Google Maps, Satélite y Calles Reales (OSRM) */}
          <MapView
            pickup={pickup}
            dropoff={dropoff}
            driverLocation={activeRide?.driver?.location}
            vehicleType={activeRide?.vehicleType || selectedVehicleType}
            userLocation={gpsCoords}
            onSelectPickup={setPickup}
            onSelectDropoff={setDropoff}
            onCenterUser={handleCenterUser}
            onOpenSearch={() => handleOpenSearchModal('dropoff')}
            selectingMode={selectingMapMode}
            onRouteCalculated={setStreetRoute}
          />

          {/* Panel Inferior Móvil (Bottom Sheet estilo Uber y Google Maps) */}
          <main className="flex-1 -mt-6 z-10 bg-[#0D111A]/95 backdrop-blur-2xl rounded-t-[32px] border-t border-white/[0.12] p-4 shadow-[0_-16px_40px_rgba(0,0,0,0.7)] space-y-4">
            {/* Manija de arrastre táctil para el Bottom Sheet */}
            <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto -mt-1 mb-1 active:bg-white/40 transition" />

            {role === 'passenger' && (
              <>
                {!activeRide ? (
                  <div className="space-y-3.5 animate-fade-in">
                    {/* 1. Selector Segmentado: Viajes vs Envíos */}
                    <div className="flex p-1 rounded-2xl bg-[#06080D]/80 border border-white/[0.08] backdrop-blur-xl shadow-inner">
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic(30);
                          setServiceMode(SERVICE_MODES.RIDES);
                        }}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center space-x-2 transition-colors duration-140 tap-scale ${
                          serviceMode === SERVICE_MODES.RIDES
                            ? 'bg-gradient-to-r from-[#00E599] to-[#00D2FF] text-black shadow-lg shadow-[#00E599]/25 font-black'
                            : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        <Car className="w-3.5 h-3.5" />
                        <span>Viajes</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic(30);
                          setServiceMode(SERVICE_MODES.DELIVERY);
                        }}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center space-x-2 transition-colors duration-140 tap-scale relative ${
                          serviceMode === SERVICE_MODES.DELIVERY
                            ? 'bg-gradient-to-r from-[#00D2FF] to-[#00E599] text-black shadow-lg shadow-[#00D2FF]/25 font-black'
                            : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Envíos</span>
                        {currentUser?.isVip ? (
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-black text-[8px] font-black tracking-tight">
                            VIP 15%
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-full bg-[#00E599]/20 text-[#00E599] border border-[#00E599]/30 text-[8px] font-black tracking-tight">
                            FLASH
                          </span>
                        )}
                      </button>
                    </div>

                    {/* 2. Tarjeta Conectada de Ruta (Pickup -> Dropoff) */}
                    <div className="bg-[#090D15]/90 backdrop-blur-2xl p-3.5 rounded-2xl border border-white/[0.08] relative shadow-lg">
                      <div className="flex items-center">
                        {/* Conector Vertical de Ruta */}
                        <div className="flex flex-col items-center mr-3 py-1 self-stretch justify-between">
                          <span className="w-3 h-3 rounded-full bg-[#00E599] shadow-[0_0_8px_rgba(0,229,153,0.8)] flex-shrink-0" />
                          <div className="w-0.5 flex-1 bg-gradient-to-b from-[#00E599] via-slate-600 to-[#00D2FF] my-1" />
                          <span className="w-3 h-3 rounded-[4px] bg-[#00D2FF] shadow-[0_0_8px_rgba(0,210,255,0.8)] flex-shrink-0" />
                        </div>

                        {/* Entradas de Origen y Destino */}
                        <div className="flex-1 space-y-2">
                          <div
                            onClick={() => handleOpenSearchModal('pickup')}
                            className={`p-2 rounded-xl transition-colors duration-140 cursor-pointer tap-scale flex items-center justify-between ${
                              selectingMapMode === 'pickup'
                                ? 'bg-white/[0.08] border border-[#00E599]/40'
                                : 'bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04]'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                                {serviceMode === SERVICE_MODES.DELIVERY ? 'Recogida de paquete' : 'Punto de partida'}
                              </span>
                              <p className="text-xs font-bold text-white truncate">{pickup.name}</p>
                            </div>
                            <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          </div>

                          <div
                            onClick={() => handleOpenSearchModal('dropoff')}
                            className={`p-2 rounded-xl transition-colors duration-140 cursor-pointer tap-scale flex items-center justify-between ${
                              selectingMapMode === 'dropoff'
                                ? 'bg-white/[0.08] border border-[#00D2FF]/40'
                                : 'bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04]'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                                {serviceMode === SERVICE_MODES.DELIVERY ? 'Destino de entrega' : '¿A dónde vas?'}
                              </span>
                              <p className="text-xs font-bold text-white truncate">{dropoff.name}</p>
                            </div>
                            <Search className="w-3.5 h-3.5 text-[#00D2FF] flex-shrink-0" />
                          </div>
                        </div>

                        {/* Botón Invertir Ruta */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSwapLocations();
                          }}
                          className="ml-2 w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#00D2FF]/50 text-slate-300 hover:text-white flex items-center justify-center tap-scale transition-colors shadow-sm"
                          title="Invertir origen y destino"
                        >
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Atajos Rápidos de Destino */}
                      <div className="flex space-x-1.5 overflow-x-auto no-scrollbar pt-2.5 mt-2.5 border-t border-white/[0.06]">
                        {POPULAR_LOCATIONS.slice(0, 4).map((spot, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              triggerHaptic(30);
                              setDropoff(spot);
                            }}
                            className="flex-shrink-0 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[10px] font-semibold text-slate-300 hover:text-white tap-scale transition-colors"
                          >
                            📍 {spot.name.split(',')[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Telemetría de Ruta (Pills compactos de distancia y tiempo) */}
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] text-slate-300 font-semibold flex items-center space-x-1">
                          <span>📍</span>
                          <span>{formatDistance(effectiveDistanceKm)}</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] text-slate-300 font-semibold flex items-center space-x-1">
                          <span>⚡</span>
                          <span>{formatDuration(streetRoute?.durationMin || currentFare.estimatedMinutes)}</span>
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Tasa BCV: <span className="text-[#00E599] font-bold">Bs. {typeof bcvRate === 'number' ? bcvRate.toFixed(2) : bcvRate}</span>
                      </span>
                    </div>

                    {/* Selector de Categorías de Viaje O Delivery */}
                    {serviceMode === SERVICE_MODES.RIDES ? (
                      <VehicleSelector
                        selectedType={selectedVehicleType}
                        onSelectType={setSelectedVehicleType}
                        distanceKm={effectiveDistanceKm}
                        bcvRate={bcvRate}
                      />
                    ) : (
                      <DeliverySelector
                        selectedType={deliveryVehicleType}
                        onSelectType={setDeliveryVehicleType}
                        packageCategory={packageCategory}
                        onSelectCategory={setPackageCategory}
                        receiverName={receiverName}
                        onChangeReceiverName={setReceiverName}
                        receiverPhone={receiverPhone}
                        onChangeReceiverPhone={setReceiverPhone}
                        deliveryNotes={deliveryNotes}
                        onChangeDeliveryNotes={setDeliveryNotes}
                        deliveryPin={deliveryPin}
                        onRegeneratePin={() => setDeliveryPin(Math.floor(1000 + Math.random() * 9000).toString())}
                        distanceKm={effectiveDistanceKm}
                        bcvRate={bcvRate}
                        isVip={Boolean(currentUser?.isVip)}
                        onOpenVipModal={() => setIsSubscriptionModalOpen(true)}
                      />
                    )}

                    {/* Botón Principal de Solicitud con degradado Electric Emerald y brillo */}
                    <button
                      onClick={handleRequestRide}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00E599] via-[#00F5A0] to-[#00D2FF] text-black font-black text-sm tracking-[-0.01em] shadow-xl shadow-[#00E599]/30 tap-scale flex items-center justify-center space-x-2 mt-2 select-none relative overflow-hidden shimmer-button"
                    >
                      <Navigation className="w-4 h-4 fill-current flex-shrink-0" />
                      <span className="truncate">
                        {serviceMode === SERVICE_MODES.DELIVERY ? 'SOLICITAR ENVÍO' : 'SOLICITAR RIDEX'} • {formatUsd(currentFare.fareUsd)} ({formatBs(currentFare.fareBs)})
                      </span>
                    </button>
                  </div>
                ) : (
                  <RideStatusCard
                    ride={activeRide}
                    onCancel={handleCancelRide}
                    onOpenPayment={() => setIsPaymentModalOpen(true)}
                  />
                )}
              </>
            )}

            {role === 'driver' && (
              <DriverDashboard
                driverProfile={driverProfile}
                isOnline={isDriverOnline}
                onToggleOnline={handleToggleDriverOnline}
                incomingOffer={driverIncomingOffer}
                activeRide={activeRide}
                onAcceptOffer={handleAcceptOffer}
                onRejectOffer={handleRejectOffer}
                onUpdateRideStatus={handleUpdateRideStatus}
                onConfirmPayment={handleConfirmPayment}
              />
            )}
          </main>
        </div>
      )}

      {/* Pestaña: Actividad */}
      {activeTab === 'activity' && (
        <div className="flex-1 p-4 pt-16">
          <ActivityView
            activeRide={activeRide}
            onSelectRideForReceipt={(ride) => {
              setSelectedRideForReceipt(ride);
              setReceiptModalOpen(true);
            }}
            onReorderRide={handleReorderRide}
          />
        </div>
      )}

      {/* Pestaña: Billetera */}
      {activeTab === 'wallet' && (
        <div className="flex-1 p-4 pt-16">
          <WalletView
            bcvRate={bcvRate}
            role={role}
            currentUser={currentUser}
            onOpenVipModal={() => setIsSubscriptionModalOpen(true)}
          />
        </div>
      )}

      {/* Pestaña: Perfil */}
      {activeTab === 'profile' && (
        <div className="flex-1 p-4 pt-16">
          <ProfileView
            role={role}
            onToggleRole={handleToggleRole}
            currentUser={currentUser}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
            onLogout={handleLogout}
            onOpenVipModal={() => setIsSubscriptionModalOpen(true)}
          />
        </div>
      )}

      {/* 3. Barra de Navegación Inferior (BottomNav) */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        badgeCount={driverIncomingOffer ? 1 : 0}
      />

      {/* 4. Modales del Sistema */}
      <RateSettingsModal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        currentRate={bcvRate}
        rateSource={rateSource}
        lastUpdated={lastUpdatedRate}
        officialDate={officialDate}
        changePercent={changePercent}
        onUpdateRate={handleUpdateRate}
        onRefreshLive={handleRefreshLiveBcv}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        ride={activeRide}
        onSubmitPayment={handleSubmitPayment}
        currentUser={currentUser}
      />

      <SearchLocationModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        title={searchModalTarget === 'pickup' ? 'Punto de Recogida (Origen)' : 'Destino del Viaje'}
        onSelectLocation={handleSelectLocationFromSearch}
      />

      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        ride={selectedRideForReceipt}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccessAuth={handleSuccessAuth}
        currentRole={role}
      />

      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        currentUser={currentUser}
        onProfileUpdated={handleProfileUpdated}
      />

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        currentUser={currentUser}
        bcvRate={bcvRate}
        onSubscriptionUpdated={(updatedUser) => {
          setCurrentUser(updatedUser);
        }}
      />

      {/* 5. Pantalla de Inicio Animada (Splash Screen) */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}
    </div>
  );
}
