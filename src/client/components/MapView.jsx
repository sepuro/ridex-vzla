import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Crosshair, MapPin, Navigation, Search, Layers } from 'lucide-react';
import { POPULAR_LOCATIONS } from '../../shared/constants.js';
import { getStreetRoute } from '../utils/routingApi.js';

export function MapView({
  pickup,
  dropoff,
  driverLocation,
  vehicleType,
  onSelectPickup,
  onSelectDropoff,
  onCenterUser,
  onOpenSearch,
  selectingMode = 'dropoff',
  onRouteCalculated
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({ pickup: null, dropoff: null, driver: null, polyline: null });
  const [routeInfo, setRouteInfo] = useState(null);

  // Inicializar mapa una sola vez
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = pickup?.lat || 10.4965;
    const initialLng = pickup?.lng || -66.8835;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    // CartoDB Dark Matter / Voyager
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Manejar toques directos en el mapa
    map.on('click', (e) => {
      const coords = { lat: e.latlng.lat, lng: e.latlng.lng };
      if (selectingMode === 'pickup') {
        onSelectPickup({ ...coords, name: `Punto fijado (${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)})` });
      } else {
        onSelectDropoff({ ...coords, name: `Destino fijado (${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)})` });
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Actualizar marcadores y calcular ruta real calle por calle (OSRM)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 1. Marcador de Origen
    if (pickup?.lat && pickup?.lng) {
      if (markersRef.current.pickup) {
        markersRef.current.pickup.setLatLng([pickup.lat, pickup.lng]);
      } else {
        const pickupIcon = L.divIcon({
          className: 'pickup-icon',
          html: `
            <div style="background-color: #10B981; width: 30px; height: 30px; border-radius: 50%; border: 3px solid #090D14; box-shadow: 0 0 16px rgba(16,185,129,0.9); display: flex; align-items: center; justify-content: center; font-weight: 900; color: #000; font-size: 13px;">
              A
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });
        markersRef.current.pickup = L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).addTo(map);
      }
    } else if (markersRef.current.pickup) {
      map.removeLayer(markersRef.current.pickup);
      markersRef.current.pickup = null;
    }

    // 2. Marcador de Destino
    if (dropoff?.lat && dropoff?.lng) {
      if (markersRef.current.dropoff) {
        markersRef.current.dropoff.setLatLng([dropoff.lat, dropoff.lng]);
      } else {
        const dropoffIcon = L.divIcon({
          className: 'dropoff-icon',
          html: `
            <div style="background-color: #F59E0B; width: 30px; height: 30px; border-radius: 50%; border: 3px solid #090D14; box-shadow: 0 0 16px rgba(245,158,11,0.9); display: flex; align-items: center; justify-content: center; font-weight: 900; color: #000; font-size: 13px;">
              B
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });
        markersRef.current.dropoff = L.marker([dropoff.lat, dropoff.lng], { icon: dropoffIcon }).addTo(map);
      }
    } else if (markersRef.current.dropoff) {
      map.removeLayer(markersRef.current.dropoff);
      markersRef.current.dropoff = null;
    }

    // 3. Marcador del Conductor en tiempo real
    if (driverLocation?.lat && driverLocation?.lng) {
      const isMoto = vehicleType === 'moto';
      const iconSvg = isMoto
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2.6"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2.6"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`;

      if (markersRef.current.driver) {
        markersRef.current.driver.setLatLng([driverLocation.lat, driverLocation.lng]);
      } else {
        const driverIcon = L.divIcon({
          className: 'driver-icon',
          html: `
            <div style="background-color: #38BDF8; width: 36px; height: 36px; border-radius: 50%; border: 3px solid #090D14; box-shadow: 0 0 18px rgba(56,189,248,0.95); display: flex; align-items: center; justify-content: center;">
              ${iconSvg}
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });
        markersRef.current.driver = L.marker([driverLocation.lat, driverLocation.lng], { icon: driverIcon }).addTo(map);
      }
    } else if (markersRef.current.driver) {
      map.removeLayer(markersRef.current.driver);
      markersRef.current.driver = null;
    }

    // 4. Trazado de ruta real calle por calle con OSRM
    if (pickup?.lat && dropoff?.lat) {
      let cancelled = false;

      getStreetRoute(pickup, dropoff).then((route) => {
        if (cancelled || !mapInstanceRef.current) return;

        if (route && route.coordinates) {
          setRouteInfo(route);
          if (onRouteCalculated) {
            onRouteCalculated(route);
          }

          if (markersRef.current.polyline) {
            markersRef.current.polyline.setLatLngs(route.coordinates);
          } else {
            markersRef.current.polyline = L.polyline(route.coordinates, {
              color: '#10B981',
              weight: 5,
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round'
            }).addTo(map);
          }

          const bounds = L.latLngBounds(route.coordinates);
          map.fitBounds(bounds, { padding: [70, 70], maxZoom: 15 });
        }
      });

      return () => {
        cancelled = true;
      };
    } else if (markersRef.current.polyline) {
      map.removeLayer(markersRef.current.polyline);
      markersRef.current.polyline = null;
      setRouteInfo(null);
    }
  }, [pickup, dropoff, driverLocation, vehicleType]);

  return (
    <div className="relative w-full h-[48vh] sm:h-[50vh] z-0 overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Barra Superior de Búsqueda y Puntos de Referencia */}
      <div className="absolute top-16 left-0 right-0 z-20 px-3 flex items-center space-x-2">
        <button
          onClick={onOpenSearch}
          className="flex-1 flex items-center space-x-2 px-3.5 py-2.5 rounded-2xl bg-cardBg/90 backdrop-blur-md border border-borderCol text-xs font-semibold text-slate-200 shadow-xl active:scale-98 transition hover:border-accentGreen"
        >
          <Search className="w-4 h-4 text-accentGreen flex-shrink-0" />
          <span className="truncate">Buscar destino en Venezuela...</span>
        </button>
      </div>

      {/* Píldoras rápidas de lugares de Caracas */}
      <div className="absolute top-28 left-0 right-0 z-20 px-3 flex space-x-1.5 overflow-x-auto no-scrollbar py-1">
        {POPULAR_LOCATIONS.map((loc) => (
          <button
            key={loc.name}
            onClick={() => {
              if (selectingMode === 'pickup') {
                onSelectPickup(loc);
              } else {
                onSelectDropoff(loc);
              }
            }}
            className="flex-shrink-0 flex items-center space-x-1 px-3 py-1.5 rounded-full bg-cardBg/90 backdrop-blur-md border border-borderCol text-[11px] font-semibold text-slate-200 shadow-md active:scale-95 transition hover:border-accentGreen"
          >
            <MapPin className="w-3 h-3 text-accentYellow" />
            <span className="truncate max-w-[130px]">{loc.name.split(',')[0]}</span>
          </button>
        ))}
      </div>

      {/* Botón flotante para centrar ubicación GPS */}
      <button
        onClick={onCenterUser}
        className="absolute bottom-4 right-4 z-20 w-11 h-11 rounded-full bg-cardBg/95 border border-borderCol text-white shadow-xl flex items-center justify-center active:scale-90 transition hover:border-accentGreen"
        title="Centrar en mi ubicación GPS"
      >
        <Crosshair className="w-5 h-5 text-accentGreen" />
      </button>

      {/* Badge de Ruteo en Vivo */}
      {routeInfo && (
        <div className="absolute bottom-4 left-4 z-20 bg-cardBg/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-borderCol text-[11px] font-bold text-white shadow-lg flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-accentGreen animate-pulse" />
          <span>Ruta por calles: {routeInfo.distanceKm} km (~{routeInfo.durationMin} min)</span>
        </div>
      )}
    </div>
  );
}
