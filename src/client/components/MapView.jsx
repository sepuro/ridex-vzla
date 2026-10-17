import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Crosshair, MapPin, Navigation } from 'lucide-react';
import { POPULAR_LOCATIONS } from '../../shared/constants.js';

export function MapView({
  pickup,
  dropoff,
  driverLocation,
  vehicleType,
  onSelectPickup,
  onSelectDropoff,
  onCenterUser,
  selectingMode = 'dropoff' // 'pickup' | 'dropoff'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({ pickup: null, dropoff: null, driver: null, polyline: null });

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

    // Usar CartoDB Dark Matter / OSM para mapa oscuro elegante
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Manejar clics en el mapa
    map.on('click', (e) => {
      const coords = { lat: e.latlng.lat, lng: e.latlng.lng };
      if (selectingMode === 'pickup') {
        onSelectPickup({ ...coords, name: 'Punto fijado en mapa' });
      } else {
        onSelectDropoff({ ...coords, name: 'Destino fijado en mapa' });
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Actualizar marcadores y ruta cuando cambian las coordenadas
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Marcador de Origen (Pickup)
    if (pickup?.lat && pickup?.lng) {
      if (markersRef.current.pickup) {
        markersRef.current.pickup.setLatLng([pickup.lat, pickup.lng]);
      } else {
        const pickupIcon = L.divIcon({
          className: 'pickup-div-icon',
          html: `
            <div style="background-color: #10B981; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #090D14; box-shadow: 0 0 14px rgba(16,185,129,0.8); display: flex; align-items: center; justify-content: center; font-weight: 800; color: #000; font-size: 13px;">
              A
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        markersRef.current.pickup = L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).addTo(map);
      }
    } else if (markersRef.current.pickup) {
      map.removeLayer(markersRef.current.pickup);
      markersRef.current.pickup = null;
    }

    // Marcador de Destino (Dropoff)
    if (dropoff?.lat && dropoff?.lng) {
      if (markersRef.current.dropoff) {
        markersRef.current.dropoff.setLatLng([dropoff.lat, dropoff.lng]);
      } else {
        const dropoffIcon = L.divIcon({
          className: 'dropoff-div-icon',
          html: `
            <div style="background-color: #F59E0B; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #090D14; box-shadow: 0 0 14px rgba(245,158,11,0.8); display: flex; align-items: center; justify-content: center; font-weight: 800; color: #000; font-size: 13px;">
              B
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        markersRef.current.dropoff = L.marker([dropoff.lat, dropoff.lng], { icon: dropoffIcon }).addTo(map);
      }
    } else if (markersRef.current.dropoff) {
      map.removeLayer(markersRef.current.dropoff);
      markersRef.current.dropoff = null;
    }

    // Marcador del Conductor en tiempo real
    if (driverLocation?.lat && driverLocation?.lng) {
      const isMoto = vehicleType === 'moto';
      const iconSvg = isMoto
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2.5"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2.5"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`;

      if (markersRef.current.driver) {
        markersRef.current.driver.setLatLng([driverLocation.lat, driverLocation.lng]);
      } else {
        const driverIcon = L.divIcon({
          className: 'driver-div-icon',
          html: `
            <div style="background-color: #38BDF8; width: 34px; height: 34px; border-radius: 50%; border: 3px solid #090D14; box-shadow: 0 0 16px rgba(56,189,248,0.9); display: flex; align-items: center; justify-content: center;">
              ${iconSvg}
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });
        markersRef.current.driver = L.marker([driverLocation.lat, driverLocation.lng], { icon: driverIcon }).addTo(map);
      }
    } else if (markersRef.current.driver) {
      map.removeLayer(markersRef.current.driver);
      markersRef.current.driver = null;
    }

    // Trazado de ruta entre Origen y Destino
    if (pickup?.lat && dropoff?.lat) {
      const latlngs = [
        [pickup.lat, pickup.lng],
        [dropoff.lat, dropoff.lng]
      ];

      if (markersRef.current.polyline) {
        markersRef.current.polyline.setLatLngs(latlngs);
      } else {
        markersRef.current.polyline = L.polyline(latlngs, {
          color: '#10B981',
          weight: 4,
          opacity: 0.9,
          dashArray: '8, 8',
          lineJoin: 'round'
        }).addTo(map);
      }

      // Ajustar vista para abarcar ambos puntos
      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    } else if (markersRef.current.polyline) {
      map.removeLayer(markersRef.current.polyline);
      markersRef.current.polyline = null;
    }
  }, [pickup, dropoff, driverLocation, vehicleType]);

  return (
    <div className="relative w-full h-[52vh] sm:h-[55vh] z-0 overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Selector Rápido de Ubicaciones en Caracas */}
      <div className="absolute top-16 left-0 right-0 z-20 px-3 flex space-x-1.5 overflow-x-auto no-scrollbar py-1">
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
            <span className="truncate max-w-[120px]">{loc.name.split(',')[0]}</span>
          </button>
        ))}
      </div>

      {/* Botón flotante para centrar ubicación */}
      <button
        onClick={onCenterUser}
        className="absolute bottom-4 right-4 z-20 w-11 h-11 rounded-full bg-cardBg/95 border border-borderCol text-white shadow-xl flex items-center justify-center active:scale-90 transition hover:border-accentGreen"
        title="Centrar en mi ubicación GPS"
      >
        <Crosshair className="w-5 h-5 text-accentGreen" />
      </button>

      {/* Banner de instrucción de toque */}
      <div className="absolute bottom-4 left-4 z-20 bg-cardBg/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-borderCol text-[11px] font-medium text-slate-300 shadow-lg flex items-center space-x-1.5">
        <Navigation className="w-3.5 h-3.5 text-accentGreen animate-pulse" />
        <span>
          Toca el mapa para fijar {selectingMode === 'pickup' ? 'Punto A (Origen)' : 'Punto B (Destino)'}
        </span>
      </div>
    </div>
  );
}
