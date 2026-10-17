import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDistance, calculateFare } from '../src/client/utils/pricing.js';
import { VEHICLE_TYPES } from '../src/shared/constants.js';

test('calculateDistance calcula correctamente la distancia en km', () => {
  // Plaza Venezuela a Plaza Altamira (~3.4 km)
  const dist = calculateDistance(10.4965, -66.8835, 10.4969, -66.8523);
  assert.ok(dist >= 3.2 && dist <= 3.6, `Distancia esperada ~3.4km, obtenida: ${dist}`);

  // Mismo punto
  assert.equal(calculateDistance(10.4965, -66.8835, 10.4965, -66.8835), 0);

  // Valores nulos
  assert.equal(calculateDistance(null, null, 10, -66), 0);
});

test('calculateFare aplica tarifa mínima cuando la distancia es muy corta', () => {
  // Moto tarifa mínima: $2.0
  const motoFare = calculateFare({
    distanceKm: 0.2,
    vehicleType: VEHICLE_TYPES.MOTO,
    bcvRate: 50.0
  });
  assert.equal(motoFare.fareUsd, 2.0);
  assert.equal(motoFare.fareBs, 100.0);

  // Carro estándar tarifa mínima: $3.5
  const carFare = calculateFare({
    distanceKm: 0.1,
    vehicleType: VEHICLE_TYPES.CARRO_STANDARD,
    bcvRate: 50.0
  });
  assert.equal(carFare.fareUsd, 3.5);
  assert.equal(carFare.fareBs, 175.0);

  // Carro confort tarifa mínima: $5.0
  const confortFare = calculateFare({
    distanceKm: 0.1,
    vehicleType: VEHICLE_TYPES.CARRO_CONFORT,
    bcvRate: 50.0
  });
  assert.equal(confortFare.fareUsd, 5.0);
  assert.equal(confortFare.fareBs, 250.0);
});

test('calculateFare calcula tarifas por distancia y conversión BCV con precisión', () => {
  const bcv = 54.0;
  const distanceKm = 10; // 10 km

  // Carro estándar: base 2.5 + (10 * 1.10) = 13.5 USD
  const fare = calculateFare({
    distanceKm,
    vehicleType: VEHICLE_TYPES.CARRO_STANDARD,
    bcvRate: bcv
  });

  assert.equal(fare.fareUsd, 13.5);
  assert.equal(fare.fareBs, 13.5 * 54.0);
  assert.ok(fare.estimatedMinutes > 0);
});
