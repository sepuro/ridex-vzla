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
  Search
} from 'lucide-react';
import { Header } from './components/Header.jsx';
import { MapView } from './components/MapView.jsx';
import { VehicleSelector } from './components/VehicleSelector.jsx';
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

  // --- Modales ---
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchModalTarget, setSearchModalTarget] = useState('dropoff'); // 'pickup' | 'dropoff'
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedRideForReceipt, setSelectedRideForReceipt] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

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
      vehicle: null
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
  const currentFare = calculateFare({
    distanceKm: effectiveDistanceKm,
    vehicleType: selectedVehicleType,
    bcvRate
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

    sendEvent('passenger:request_ride', {
      pickup,
      dropoff,
      vehicleType: selectedVehicleType,
      fareUsd: currentFare.fareUsd,
      fareBs: currentFare.fareBs,
      bcvRate,
      distanceKm: effectiveDistanceKm,
      estimatedMinutes: streetRoute?.durationMin || currentFare.estimatedMinutes
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
          <main className="flex-1 -mt-6 z-10 bg-[#0c101b]/95 backdrop-blur-2xl rounded-t-[32px] border-t border-white/15 p-4 shadow-[0_-12px_40px_rgba(0,0,0,0.5)] space-y-4">
            {/* Manija de arrastre táctil para el Bottom Sheet */}
            <div className="w-12 h-1.5 rounded-full bg-slate-500/30 mx-auto -mt-1 mb-1 active:bg-slate-400 transition" />

            {role === 'passenger' && (
              <>
                {!activeRide ? (
                  <div className="space-y-3.5 animate-fade-in">
                    {/* Selector de Origen y Destino con búsqueda integrada estilo Pixel & iPhone */}
                    <div className="bg-[#111622]/90 backdrop-blur-xl p-3.5 rounded-2xl border border-white/10 relative space-y-2 shadow-inner">
                      {/* Origen */}
                      <div
                        onClick={() => handleOpenSearchModal('pickup')}
                        className={`flex items-center space-x-2.5 p-2 rounded-xl transition cursor-pointer ${
                          selectingMapMode === 'pickup'
                            ? 'bg-[#182030] border border-pixel-green shadow-sm'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <span className="w-6 h-6 rounded-full bg-pixel-green/20 text-pixel-greenLight flex items-center justify-center font-black text-xs flex-shrink-0">
                          A
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Punto de Recogida</span>
                          <p className="text-xs font-semibold text-white truncate">{pickup.name}</p>
                        </div>
                        <Search className="w-3.5 h-3.5 text-slate-400" />
                      </div>

                      {/* Destino */}
                      <div
                        onClick={() => handleOpenSearchModal('dropoff')}
                        className={`flex items-center space-x-2.5 p-2 rounded-xl transition cursor-pointer ${
                          selectingMapMode === 'dropoff'
                            ? 'bg-[#182030] border border-pixel-red shadow-sm'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <span className="w-6 h-6 rounded-full bg-pixel-red/20 text-pixel-redLight flex items-center justify-center font-black text-xs flex-shrink-0">
                          B
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Destino</span>
                          <p className="text-xs font-semibold text-white truncate">{dropoff.name}</p>
                        </div>
                        <Search className="w-3.5 h-3.5 text-slate-400" />
                      </div>

                      {/* Botón para intercambiar origen y destino */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSwapLocations();
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900 border border-white/15 text-slate-300 flex items-center justify-center active:scale-90 transition hover:text-white hover:border-pixel-blueLight shadow-md"
                        title="Invertir ruta"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Telemetría de Ruta */}
                    <div className="flex items-center justify-between px-2 text-xs text-slate-400 font-medium">
                      <span>Distancia: <strong className="text-white">{formatDistance(effectiveDistanceKm)}</strong></span>
                      <span>Tiempo: <strong className="text-white">{formatDuration(streetRoute?.durationMin || currentFare.estimatedMinutes)}</strong></span>
                    </div>

                    {/* Selector de Categorías (Moto, Carro Estándar, Carro Confort) */}
                    <VehicleSelector
                      selectedType={selectedVehicleType}
                      onSelectType={setSelectedVehicleType}
                      distanceKm={effectiveDistanceKm}
                      bcvRate={bcvRate}
                    />

                    {/* Botón Principal de Solicitud con degradado Pixel Green */}
                    <button
                      onClick={handleRequestRide}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-pixel-green to-emerald-400 hover:brightness-105 text-black font-black text-sm tracking-wide shadow-xl shadow-pixel-green/30 transition active:scale-[0.98] flex items-center justify-center space-x-2 mt-2"
                    >
                      <Navigation className="w-4 h-4 fill-current" />
                      <span>SOLICITAR RIDEX • {formatUsd(currentFare.fareUsd)} ({formatBs(currentFare.fareBs)})</span>
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
          <WalletView bcvRate={bcvRate} role={role} />
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
    </div>
  );
}
