export const RIDE_STATUS = {
  IDLE: 'IDLE',
  SEARCHING: 'SEARCHING',
  OFFERED: 'OFFERED',
  ACCEPTED: 'ACCEPTED',
  ARRIVED: 'ARRIVED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED'
};

export const VEHICLE_TYPES = {
  MOTO: 'moto',
  CARRO_STANDARD: 'carro_standard',
  CARRO_CONFORT: 'carro_confort'
};

export const VEHICLE_CONFIGS = {
  [VEHICLE_TYPES.MOTO]: {
    id: VEHICLE_TYPES.MOTO,
    name: 'Moto Express',
    subtitle: 'Rápido, ideal para el tráfico caraqueño',
    icon: 'Bike',
    baseFareUsd: 1.5,
    perKmUsd: 0.70,
    minFareUsd: 2.0,
    capacity: 1,
    timeFactor: 0.8
  },
  [VEHICLE_TYPES.CARRO_STANDARD]: {
    id: VEHICLE_TYPES.CARRO_STANDARD,
    name: 'Carro Estándar',
    subtitle: 'Económico y cómodo para 3-4 personas',
    icon: 'Car',
    baseFareUsd: 2.5,
    perKmUsd: 1.10,
    minFareUsd: 3.5,
    capacity: 4,
    timeFactor: 1.0
  },
  [VEHICLE_TYPES.CARRO_CONFORT]: {
    id: VEHICLE_TYPES.CARRO_CONFORT,
    name: 'Carro Confort (A/C)',
    subtitle: 'Vehículo moderno con aire acondicionado full',
    icon: 'Sparkles',
    baseFareUsd: 4.0,
    perKmUsd: 1.50,
    minFareUsd: 5.0,
    capacity: 4,
    timeFactor: 1.0
  }
};

export const PAYMENT_METHODS = {
  PAGO_MOVIL: 'pago_movil',
  EFECTIVO_USD: 'efectivo_usd',
  BINANCE_USDT: 'binance_usdt',
  ZELLE: 'zelle'
};

export const PAYMENT_METHOD_NAMES = {
  [PAYMENT_METHODS.PAGO_MOVIL]: 'Pago Móvil (Bolívares)',
  [PAYMENT_METHODS.EFECTIVO_USD]: 'Efectivo USD (Divisas)',
  [PAYMENT_METHODS.BINANCE_USDT]: 'Binance Pay (USDT)',
  [PAYMENT_METHODS.ZELLE]: 'Zelle (USD)'
};

export const DEFAULT_BCV_RATE = 54.20; // Tasa referencial oficial actual

// Puntos de referencia populares en Caracas para selección rápida sin tipear
export const POPULAR_LOCATIONS = [
  { name: 'Plaza Venezuela, Caracas', lat: 10.4965, lng: -66.8835 },
  { name: 'Plaza Altamira, Chacao', lat: 10.4969, lng: -66.8523 },
  { name: 'Centro Comercial CCCT, Chuao', lat: 10.4852, lng: -66.8596 },
  { name: 'Las Mercedes (Calle París)', lat: 10.4789, lng: -66.8654 },
  { name: 'Capitolio / El Silencio (Centro)', lat: 10.5050, lng: -66.9150 },
  { name: 'Sabana Grande (Bulevar)', lat: 10.4935, lng: -66.8778 },
  { name: 'La Candelaria, Caracas', lat: 10.5068, lng: -66.9034 },
  { name: 'Terminal La Bandera', lat: 10.4795, lng: -66.9095 }
];

// Avatares venezolanos predeterminados en SVG optimizado
export const DEFAULT_AVATARS = {
  driver_moto: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="30" fill="%231A73E8"/><circle cx="50" cy="40" r="20" fill="%23FFFFFF"/><path d="M20 85c0-16 13-28 30-28s30 12 30 28" fill="%23FFFFFF"/><circle cx="50" cy="35" r="10" fill="%23090D14"/><path d="M42 35h16v6h-16z" fill="%23FBBC04"/></svg>',
  driver_car: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="30" fill="%2334A853"/><circle cx="50" cy="40" r="20" fill="%23FFFFFF"/><path d="M20 85c0-16 13-28 30-28s30 12 30 28" fill="%23FFFFFF"/><path d="M38 32h24v12H38z" fill="%23090D14"/></svg>',
  passenger_female: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="30" fill="%239333EA"/><circle cx="50" cy="38" r="19" fill="%23FED7AA"/><path d="M31 38c0 14 38 14 38 0-4-12-14-18-19-18s-15 6-19 18z" fill="%237C2D12"/><path d="M22 86c0-15 12-26 28-26s28 11 28 26" fill="%23EC4899"/></svg>',
  passenger_male: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="30" fill="%230EA5E9"/><circle cx="50" cy="38" r="19" fill="%23FED7AA"/><path d="M32 28c4-8 32-8 36 0-3-4-12-6-18-6s-15 2-18 6z" fill="%231E293B"/><path d="M22 86c0-15 12-26 28-26s28 11 28 26" fill="%2338BDF8"/></svg>'
};
