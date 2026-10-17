import { useState, useEffect, useCallback } from 'react';

const DEFAULT_COORDS = { lat: 10.4965, lng: -66.8835 }; // Plaza Venezuela, Caracas

export function useGeolocation() {
  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada en este dispositivo.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('No se pudo obtener GPS, usando ubicación predeterminada:', err.message);
        setError(err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { coords, setCoords, error, loading, requestLocation };
}
