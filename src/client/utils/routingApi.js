import { calculateDistance } from './pricing.js';

/**
 * Consulta la API pública de ruteo OSRM (Open Source Routing Machine)
 * para obtener la geometría real de las calles, distancia real y tiempo de viaje.
 */
export async function getStreetRoute(pickup, dropoff) {
  if (!pickup || !dropoff || !pickup.lat || !dropoff.lat) {
    return null;
  }

  const directDistanceKm = calculateDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?overview=full&geometries=geojson`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // Invertir coordenadas [lng, lat] a [lat, lng] para Leaflet
        const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        const distanceKm = Math.round((route.distance / 1000) * 100) / 100;
        const durationMin = Math.max(3, Math.round(route.duration / 60));

        return {
          coordinates,
          distanceKm: distanceKm || directDistanceKm,
          durationMin,
          source: 'OSRM OpenStreetMap'
        };
      }
    }
  } catch (err) {
    console.warn('[Routing API] Usando ruta directa de respaldo:', err.message);
  }

  // Fallback seguro: línea recta si la red externa está lenta o no responde
  return {
    coordinates: [
      [pickup.lat, pickup.lng],
      [dropoff.lat, dropoff.lng]
    ],
    distanceKm: Math.round(directDistanceKm * 1.25 * 100) / 100, // Factor de curvatura urbana
    durationMin: Math.max(4, Math.round(directDistanceKm * 2.8)),
    source: 'Estimación urbana local'
  };
}
