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
