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
  const [rateSource, setRateSource] = useState('Oficial BCV');
  const [lastUpdatedRate, setLastUpdatedRate] = useState(null);

  // --- Modales ---
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchModalTarget, setSearchModalTarget] = useState('dropoff'); // 'pickup' | 'dropoff'
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedRideForReceipt, setSelectedRideForReceipt] = useState(null);

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
  const [driverProfile, setDriverProfile] = useState({
    driverId: 'drv_my_phone',
    name: 'Carlos Mendoza',
    phone: '0412-9876543',
    vehicleType: VEHICLE_TYPES.MOTO,
    plate: 'AD712YZ',
    model: 'Bera SBR 150',
    color: 'Rojo',
    rating: 4.97
  });
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
          setRateSource(data.source || 'BCV');
          setLastUpdatedRate(data.lastUpdated);
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
        playNotificationChime();
        break;
      }

      case 'ride:accepted':
      case 'ride:assigned': {
        setActiveRide(data);
        setDriverIncomingOffer(null);
        playAcceptChime();
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
          playArrivalChime();
        } else {
          triggerHaptic(120);
        }
        break;
      }

      case 'ride:payment_submitted':
      case 'ride:payment_pending_confirmation': {
        setActiveRide(data);
        triggerHaptic(100);
        break;
      }

      case 'ride:completed_and_paid': {
        setActiveRide(data);
        playAcceptChime();
        setSelectedRideForReceipt(data);
        setReceiptModalOpen(true);
        break;
      }

      case 'ride:cancelled': {
        setActiveRide(null);
        setDriverIncomingOffer(null);
        triggerHaptic([100, 50, 100]);
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

  const handleToggleRole = () => {
    const nextRole = role === 'passenger' ? 'driver' : 'passenger';
    setRole(nextRole);
    sendEvent('client:init', {
      role: nextRole,
      meta: nextRole === 'driver' ? driverProfile : { name: 'Pasajero Android' }
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
        setRateSource(data.source);
        setLastUpdatedRate(data.lastUpdated);
      }
    } catch (err) {
      console.error('Error guardando tasa:', err);
    }
  };

  const handleRefreshLiveBcv = async () => {
    const res = await fetch('/api/bcv/refresh', { method: 'POST' });
    return await res.json();
  };

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 flex flex-col max-w-md mx-auto relative shadow-2xl overflow-x-hidden safe-area-pt">
      {/* 1. Header con switch de rol y tasa BCV */}
      <Header
        role={role}
        onToggleRole={handleToggleRole}
        bcvRate={bcvRate}
        onOpenRateModal={() => setIsRateModalOpen(true)}
        connected={connected}
      />

      {/* 2. Contenido según la pestaña activa */}
      {activeTab === 'rides' && (
        <div className="flex flex-col flex-1 pb-20">
          {/* Mapa Interactivo con API de Calles Reales (OSRM) */}
          <MapView
            pickup={pickup}
            dropoff={dropoff}
            driverLocation={activeRide?.driver?.location}
            vehicleType={activeRide?.vehicleType || selectedVehicleType}
            onSelectPickup={setPickup}
            onSelectDropoff={setDropoff}
            onCenterUser={handleCenterUser}
            onOpenSearch={() => handleOpenSearchModal('dropoff')}
            selectingMode={selectingMapMode}
            onRouteCalculated={setStreetRoute}
          />

          {/* Panel Inferior Móvil (Bottom Sheet) */}
          <main className="flex-1 -mt-6 z-10 bg-cardBg rounded-t-3xl border-t border-borderCol p-4 shadow-2xl space-y-4">
            {role === 'passenger' && (
              <>
                {!activeRide ? (
                  <div className="space-y-3.5 animate-fade-in">
                    {/* Selector de Origen y Destino con búsqueda integrada */}
                    <div className="bg-surfaceBg/70 p-3 rounded-2xl border border-borderCol/80 relative space-y-2">
                      {/* Origen */}
                      <div
                        onClick={() => handleOpenSearchModal('pickup')}
                        className={`flex items-center space-x-2.5 p-2 rounded-xl transition cursor-pointer ${
                          selectingMapMode === 'pickup'
                            ? 'bg-darkBg border border-accentGreen shadow-sm'
                            : 'hover:bg-darkBg/50'
                        }`}
                      >
                        <span className="w-6 h-6 rounded-full bg-accentGreen/20 text-accentGreen flex items-center justify-center font-bold text-xs flex-shrink-0">
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
                            ? 'bg-darkBg border border-accentYellow shadow-sm'
                            : 'hover:bg-darkBg/50'
                        }`}
                      >
                        <span className="w-6 h-6 rounded-full bg-accentYellow/20 text-accentYellow flex items-center justify-center font-bold text-xs flex-shrink-0">
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
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surfaceBg border border-borderCol text-slate-300 flex items-center justify-center active:scale-90 transition hover:text-white hover:border-accentGreen shadow-md"
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

                    {/* Botón Principal de Solicitud */}
                    <button
                      onClick={handleRequestRide}
                      className="w-full py-4 rounded-2xl bg-accentGreen hover:bg-emerald-400 text-black font-black text-sm tracking-wide shadow-xl shadow-accentGreen/25 transition active:scale-98 flex items-center justify-center space-x-2 mt-2"
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
            driverProfile={driverProfile}
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
    </div>
  );
}
