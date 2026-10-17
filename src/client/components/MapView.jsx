import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Crosshair, MapPin, Navigation, Search, Layers, Compass, Check, Sparkles } from 'lucide-react';
import { POPULAR_LOCATIONS } from '../../shared/constants.js';
import { getStreetRoute } from '../utils/routingApi.js';
import { triggerHaptic } from '../utils/soundEffects.js';

// Catálogo de capas de mapas públicas y Google Maps
const MAP_PROVIDERS = {
  google_streets: {
    id: 'google_streets',
    name: 'Google Maps Calles',
    badge: 'Google',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
    darkFilter: false,
    icon: '🗺️'
  },
  google_satellite: {
    id: 'google_satellite',
    name: 'Google Maps Satélite',
    badge: 'Google Híbrido',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
    darkFilter: false,
    icon: '🛰️'
  },
  iphone_dark: {
    id: 'iphone_dark',
    name: 'iPhone Dark Voyager',
    badge: 'Cupertino Dark',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    maxZoom: 19,
    darkFilter: false,
    icon: '🌙'
  },
  iphone_light: {
    id: 'iphone_light',
    name: 'iPhone Positron Clean',
    badge: 'Cupertino Clean',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    maxZoom: 19,
    darkFilter: false,
    icon: '☀️'
  },
  osm: {
    id: 'osm',
    name: 'OpenStreetMap Estándar',
    badge: 'Ligero 3G/4G',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: 'abc',
    maxZoom: 19,
    darkFilter: false,
    icon: '🌍'
  }
};

export function MapView({
  pickup,
  dropoff,
  driverLocation,
  vehicleType,
  userLocation,
  onSelectPickup,
  onSelectDropoff,
  onCenterUser,
  onOpenSearch,
  selectingMode = 'dropoff',
  onRouteCalculated
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const activeTileLayerRef = useRef(null);
  const markersRef = useRef({ pickup: null, dropoff: null, driver: null, userGps: null, polyline: null });
  
  const [selectedProvider, setSelectedProvider] = useState(() => {
    return localStorage.getItem('ridex_map_provider') || 'google_streets';
  });
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);

  // Inicializar Leaflet Map
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

    const providerConfig = MAP_PROVIDERS[selectedProvider] || MAP_PROVIDERS.google_streets;
    const tileLayer = L.tileLayer(providerConfig.url, {
      maxZoom: providerConfig.maxZoom,
      subdomains: providerConfig.subdomains
    }).addTo(map);

    activeTileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    // Toque directo en el mapa para marcar punto
    map.on('click', (e) => {
      const coords = { lat: e.latlng.lat, lng: e.latlng.lng };
      triggerHaptic(40);
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

  // Cambiar proveedor de mapa en tiempo real
  const handleSelectProvider = (providerId) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const providerConfig = MAP_PROVIDERS[providerId];
    if (!providerConfig) return;

    triggerHaptic(50);
    if (activeTileLayerRef.current) {
      map.removeLayer(activeTileLayerRef.current);
    }

    const newLayer = L.tileLayer(providerConfig.url, {
      maxZoom: providerConfig.maxZoom,
      subdomains: providerConfig.subdomains
    }).addTo(map);

    activeTileLayerRef.current = newLayer;
    setSelectedProvider(providerId);
    localStorage.setItem('ridex_map_provider', providerId);
    setIsLayerMenuOpen(false);
  };

  // Actualizar marcadores y ruta OSRM
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 1. Marcador Origen (A) - Estilo Verde Pixel/iOS
    if (pickup?.lat && pickup?.lng) {
      if (markersRef.current.pickup) {
        markersRef.current.pickup.setLatLng([pickup.lat, pickup.lng]);
      } else {
        const pickupIcon = L.divIcon({
          className: 'pickup-marker',
          html: `
            <div style="background-color: #34A853; width: 32px; height: 32px; border-radius: 50%; border: 3px solid #FFFFFF; box-shadow: 0 4px 14px rgba(52,168,83,0.85); display: flex; align-items: center; justify-content: center; font-weight: 900; color: #FFFFFF; font-size: 13px;">
              A
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        markersRef.current.pickup = L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).addTo(map);
      }
    } else if (markersRef.current.pickup) {
      map.removeLayer(markersRef.current.pickup);
      markersRef.current.pickup = null;
    }

    // 2. Marcador Destino (B) - Estilo Rojo Pixel/iOS
    if (dropoff?.lat && dropoff?.lng) {
      if (markersRef.current.dropoff) {
        markersRef.current.dropoff.setLatLng([dropoff.lat, dropoff.lng]);
      } else {
        const dropoffIcon = L.divIcon({
          className: 'dropoff-marker',
          html: `
            <div style="background-color: #EA4335; width: 32px; height: 32px; border-radius: 50%; border: 3px solid #FFFFFF; box-shadow: 0 4px 14px rgba(234,67,53,0.85); display: flex; align-items: center; justify-content: center; font-weight: 900; color: #FFFFFF; font-size: 13px;">
              B
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        markersRef.current.dropoff = L.marker([dropoff.lat, dropoff.lng], { icon: dropoffIcon }).addTo(map);
      }
    } else if (markersRef.current.dropoff) {
      map.removeLayer(markersRef.current.dropoff);
      markersRef.current.dropoff = null;
    }

    // 3. Marcador del Conductor con animación
    if (driverLocation?.lat && driverLocation?.lng) {
      const isMoto = vehicleType === 'moto';
      const iconSvg = isMoto
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`;

      if (markersRef.current.driver) {
        markersRef.current.driver.setLatLng([driverLocation.lat, driverLocation.lng]);
      } else {
        const driverIcon = L.divIcon({
          className: 'driver-marker',
          html: `
            <div style="background-color: #1A73E8; width: 38px; height: 38px; border-radius: 50%; border: 3px solid #FFFFFF; box-shadow: 0 0 20px rgba(26,115,232,0.9); display: flex; align-items: center; justify-content: center;">
              ${iconSvg}
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 19]
        });
        markersRef.current.driver = L.marker([driverLocation.lat, driverLocation.lng], { icon: driverIcon }).addTo(map);
      }
    } else if (markersRef.current.driver) {
      map.removeLayer(markersRef.current.driver);
      markersRef.current.driver = null;
    }

    // 4. Marcador de Ubicación GPS en Vivo (Punto Azul Google Maps)
    if (userLocation?.lat && userLocation?.lng) {
      if (markersRef.current.userGps) {
        markersRef.current.userGps.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        const userGpsIcon = L.divIcon({
          className: 'user-gps-marker',
          html: `
            <div class="gps-pulse-dot" style="width: 20px; height: 20px; border-radius: 50%; background-color: #1A73E8; border: 3px solid #FFFFFF; box-shadow: 0 0 10px rgba(26,115,232,0.8);">
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        markersRef.current.userGps = L.marker([userLocation.lat, userLocation.lng], { icon: userGpsIcon }).addTo(map);
      }
    }

    // 5. Trazado de Ruta Real por Carretera con OSRM
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
              color: '#1A73E8',
              weight: 5.5,
              opacity: 0.95,
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
  }, [pickup, dropoff, driverLocation, vehicleType, userLocation]);

  // Centrar en la ruta completa
  const handleRecenterRoute = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    triggerHaptic(40);
    if (markersRef.current.polyline) {
      map.fitBounds(markersRef.current.polyline.getBounds(), { padding: [60, 60] });
    } else if (pickup?.lat && dropoff?.lat) {
      const bounds = L.latLngBounds([[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]]);
      map.fitBounds(bounds, { padding: [60, 60] });
    } else if (pickup?.lat) {
      map.flyTo([pickup.lat, pickup.lng], 15);
    }
  };

  return (
    <div className="relative w-full h-[50vh] sm:h-[52vh] z-0 overflow-hidden select-none">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* 1. Barra Flotante de Búsqueda estilo Google Pixel y iPhone */}
      <div className="absolute top-16 left-3 right-3 z-20 flex items-center space-x-2">
        <button
          onClick={onOpenSearch}
          className="flex-1 flex items-center space-x-2.5 px-4 py-3 rounded-2xl bg-[#111622]/85 backdrop-blur-2xl border border-white/15 text-xs font-semibold text-slate-100 shadow-[0_8px_25px_rgba(0,0,0,0.4)] active:scale-98 transition hover:border-pixel-blueLight/60"
        >
          <Search className="w-4 h-4 text-pixel-blueLight flex-shrink-0" />
          <span className="truncate">¿A dónde vas en Venezuela? (Buscar...)</span>
        </button>
      </div>

      {/* 2. Píldoras Rápidas de Destinos Caraqueños con estética Cupertino */}
      <div className="absolute top-28 left-0 right-0 z-20 px-3 flex space-x-1.5 overflow-x-auto no-scrollbar py-1">
        {POPULAR_LOCATIONS.map((loc) => (
          <button
            key={loc.name}
            onClick={() => {
              triggerHaptic(30);
              if (selectingMode === 'pickup') {
                onSelectPickup(loc);
              } else {
                onSelectDropoff(loc);
              }
            }}
            className="flex-shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#111622]/90 backdrop-blur-xl border border-white/10 text-[11px] font-bold text-slate-200 shadow-md active:scale-95 transition hover:border-pixel-blueLight/50"
          >
            <MapPin className="w-3 h-3 text-pixel-yellow" />
            <span className="truncate max-w-[130px]">{loc.name.split(',')[0]}</span>
          </button>
        ))}
      </div>

      {/* 3. Stack de Botones Flotantes en el Borde Derecho (Google Maps & Apple Maps style) */}
      <div className="absolute bottom-5 right-3.5 z-20 flex flex-col space-y-2.5">
        {/* Selector de Capa / Proveedor de Mapa */}
        <button
          onClick={() => {
            triggerHaptic(40);
            setIsLayerMenuOpen(!isLayerMenuOpen);
          }}
          className="w-11 h-11 rounded-2xl bg-[#111622]/90 backdrop-blur-xl border border-white/15 text-white shadow-xl flex items-center justify-center active:scale-90 transition hover:border-pixel-blueLight"
          title="Cambiar capa de mapa (Google Maps / Satélite / Dark)"
        >
          <Layers className="w-5 h-5 text-pixel-blueLight" />
        </button>

        {/* Centrar en Ubicación GPS */}
        <button
          onClick={() => {
            triggerHaptic(50);
            onCenterUser();
          }}
          className="w-11 h-11 rounded-2xl bg-[#111622]/90 backdrop-blur-xl border border-white/15 text-white shadow-xl flex items-center justify-center active:scale-90 transition hover:border-pixel-greenLight"
          title="Centrar en mi ubicación GPS"
        >
          <Crosshair className="w-5 h-5 text-pixel-greenLight" />
        </button>

        {/* Recenter Ruta */}
        <button
          onClick={handleRecenterRoute}
          className="w-11 h-11 rounded-2xl bg-[#111622]/90 backdrop-blur-xl border border-white/15 text-white shadow-xl flex items-center justify-center active:scale-90 transition hover:border-pixel-yellowLight"
          title="Ver ruta completa"
        >
          <Compass className="w-5 h-5 text-pixel-yellow" />
        </button>
      </div>

      {/* 4. Menú Flotante de Selección de Capas de Mapa (Google Maps / Satélite / Apple Maps) */}
      {isLayerMenuOpen && (
        <div className="absolute bottom-20 right-3.5 z-30 w-64 rounded-3xl bg-[#111622]/95 backdrop-blur-2xl border border-white/20 p-3 shadow-2xl animate-fade-in space-y-1.5">
          <div className="flex items-center justify-between pb-1.5 px-1 border-b border-white/10 text-xs font-extrabold text-white">
            <span className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pixel-blueLight" />
              <span>Capa de Mapa</span>
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">APIs Oficiales</span>
          </div>

          <div className="space-y-1">
            {Object.values(MAP_PROVIDERS).map((provider) => {
              const isSelected = selectedProvider === provider.id;
              return (
                <button
                  key={provider.id}
                  onClick={() => handleSelectProvider(provider.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-2xl text-left text-xs transition ${
                    isSelected
                      ? 'bg-pixel-blue/20 border border-pixel-blue/40 text-white font-bold'
                      : 'hover:bg-white/5 text-slate-300 font-medium'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{provider.icon}</span>
                    <div>
                      <p className="text-xs leading-none">{provider.name}</p>
                      <span className="text-[9px] text-slate-400 block mt-0.5">{provider.badge}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-pixel-blueLight" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Badge de Telemetría de Ruta en Vivo */}
      {routeInfo && (
        <div className="absolute bottom-5 left-3.5 z-20 bg-[#111622]/90 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/15 text-[11px] font-bold text-white shadow-lg flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-pixel-greenLight animate-pulse" />
          <span>{routeInfo.distanceKm} km (~{routeInfo.durationMin} min vía OSRM)</span>
        </div>
      )}
    </div>
  );
}
