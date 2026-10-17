import { VEHICLE_CONFIGS, VEHICLE_TYPES, DEFAULT_BCV_RATE } from '../../shared/constants.js';

/**
 * Calcula la distancia ortodrómica en kilómetros entre dos coordenadas usando la fórmula de Haversine.
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return 0;
  }

  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;

  return Math.round(distanceKm * 100) / 100;
}

/**
 * Calcula la tarifa estimada para un viaje en USD y su equivalente en Bolívares según la tasa BCV.
 */
export function calculateFare({
  distanceKm = 0,
  vehicleType = VEHICLE_TYPES.CARRO_STANDARD,
  bcvRate = DEFAULT_BCV_RATE,
  surgeMultiplier = 1.0
}) {
  const config = VEHICLE_CONFIGS[vehicleType] || VEHICLE_CONFIGS[VEHICLE_TYPES.CARRO_STANDARD];

  // Cálculo de tarifa base + kilometraje
  const rawFareUsd = (config.baseFareUsd + (distanceKm * config.perKmUsd)) * surgeMultiplier;
  
  // Asegurar tarifa mínima del vehículo
  const fareUsd = Math.max(config.minFareUsd, Math.round(rawFareUsd * 100) / 100);

  // Conversión exacta a Bolívares usando la tasa oficial BCV
  const fareBs = Math.round(fareUsd * bcvRate * 100) / 100;

  // Estimación de tiempo en minutos
  const avgSpeedKmH = vehicleType === VEHICLE_TYPES.MOTO ? 28 : 22; // Las motos se desplazan más rápido en el tráfico
  const estimatedMinutes = Math.max(3, Math.round((distanceKm / avgSpeedKmH) * 60) + 2);

  return {
    distanceKm,
    vehicleType,
    fareUsd,
    fareBs,
    bcvRate,
    estimatedMinutes
  };
}
