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
 * Calcula la tarifa estimada para un viaje o delivery en USD y su equivalente en Bolívares según la tasa BCV.
 * Aplica automáticamente el descuento si el usuario es miembro de RideX Pass VIP.
 */
export function calculateFare({
  distanceKm = 0,
  vehicleType = VEHICLE_TYPES.CARRO_STANDARD,
  bcvRate = DEFAULT_BCV_RATE,
  surgeMultiplier = 1.0,
  isVip = false,
  vipDiscountPercent = 15
}) {
  const config = VEHICLE_CONFIGS[vehicleType] || VEHICLE_CONFIGS[VEHICLE_TYPES.CARRO_STANDARD];

  // Cálculo de tarifa base + kilometraje
  const rawFareUsd = (config.baseFareUsd + (distanceKm * config.perKmUsd)) * surgeMultiplier;
  
  // Tarifa regular (antes de posible descuento VIP)
  const regularFareUsd = Math.max(config.minFareUsd, Math.round(rawFareUsd * 100) / 100);

  // Aplicar descuento VIP si está activo
  let fareUsd = regularFareUsd;
  let savingsUsd = 0;
  if (isVip && vipDiscountPercent > 0) {
    const discounted = regularFareUsd * (1 - vipDiscountPercent / 100);
    // Permitir descuento sin bajar de una cota prudente
    fareUsd = Math.max(1.0, Math.round(discounted * 100) / 100);
    savingsUsd = Math.round((regularFareUsd - fareUsd) * 100) / 100;
  }

  // Conversión exacta a Bolívares usando la tasa oficial BCV
  const fareBs = Math.round(fareUsd * bcvRate * 100) / 100;
  const regularFareBs = Math.round(regularFareUsd * bcvRate * 100) / 100;
  const savingsBs = Math.round(savingsUsd * bcvRate * 100) / 100;

  // Estimación de tiempo en minutos
  const isMotoType = vehicleType === VEHICLE_TYPES.MOTO || vehicleType === VEHICLE_TYPES.DELIVERY_MOTO;
  const avgSpeedKmH = isMotoType ? 28 : 22; // Las motos se desplazan más rápido en el tráfico
  const estimatedMinutes = Math.max(3, Math.round((distanceKm / avgSpeedKmH) * 60) + 2);

  return {
    distanceKm,
    vehicleType,
    fareUsd,
    fareBs,
    regularFareUsd,
    regularFareBs,
    isVip,
    savingsUsd,
    savingsBs,
    bcvRate,
    estimatedMinutes
  };
}
