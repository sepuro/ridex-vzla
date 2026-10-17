import test from 'node:test';
import assert from 'node:assert/strict';
import { RideManager } from '../src/server/rideManager.js';
import { RIDE_STATUS, VEHICLE_TYPES, PAYMENT_METHODS } from '../src/shared/constants.js';

test('Ciclo de vida completo del viaje en RideManager', () => {
  const manager = new RideManager();

  // Simular conexión de conductor y pasajero
  const mockPassengerWs = { readyState: 1, send: () => {} };
  const mockDriverWs = { readyState: 1, send: () => {} };

  manager.registerClient('client_passenger_1', mockPassengerWs, 'passenger');
  manager.registerClient('client_driver_1', mockDriverWs, 'driver', {
    driverId: 'drv_101',
    name: 'José Morales',
    vehicleType: VEHICLE_TYPES.MOTO,
    plate: 'AB99XX',
    model: 'Bera 150'
  });

  // 1. Pasajero solicita viaje
  const ride = manager.createRide({
    passengerClientId: 'client_passenger_1',
    passengerName: 'Valeria Gómez',
    passengerPhone: '04121234567',
    pickup: { name: 'Plaza Venezuela', lat: 10.4965, lng: -66.8835 },
    dropoff: { name: 'Plaza Altamira', lat: 10.4969, lng: -66.8523 },
    vehicleType: VEHICLE_TYPES.MOTO,
    fareUsd: 2.50,
    fareBs: 135.50,
    bcvRate: 54.20,
    distanceKm: 3.4,
    estimatedMinutes: 9
  });

  assert.equal(ride.status, RIDE_STATUS.SEARCHING);
  assert.equal(ride.passengerName, 'Valeria Gómez');

  // 2. Conductor acepta el viaje
  const acceptedRide = manager.acceptRide(ride.id, 'drv_101');
  assert.equal(acceptedRide.status, RIDE_STATUS.ACCEPTED);
  assert.equal(acceptedRide.driver.name, 'José Morales');

  // 3. Conductor llega al punto de encuentro
  const arrivedRide = manager.updateRideStatus(ride.id, RIDE_STATUS.ARRIVED);
  assert.equal(arrivedRide.status, RIDE_STATUS.ARRIVED);

  // 4. Inicia el viaje
  const inProgressRide = manager.updateRideStatus(ride.id, RIDE_STATUS.IN_PROGRESS);
  assert.equal(inProgressRide.status, RIDE_STATUS.IN_PROGRESS);

  // 5. Finaliza el viaje
  const completedRide = manager.updateRideStatus(ride.id, RIDE_STATUS.COMPLETED);
  assert.equal(completedRide.status, RIDE_STATUS.COMPLETED);

  // 6. Pasajero envía comprobante de Pago Móvil
  const paymentRide = manager.submitPayment(ride.id, {
    method: PAYMENT_METHODS.PAGO_MOVIL,
    bankCode: '0102',
    phone: '04121234567',
    reference: '987654',
    amountBs: 135.50,
    amountUsd: 2.50
  });
  assert.ok(paymentRide.payment);
  assert.equal(paymentRide.payment.reference, '987654');

  // 7. Conductor confirma recepción de pago
  const paidRide = manager.confirmPayment(ride.id, 'drv_101');
  assert.equal(paidRide.status, RIDE_STATUS.PAID);
  assert.ok(paidRide.paymentConfirmedAt > 0);
});

test('Cancelación de viaje en RideManager', () => {
  const manager = new RideManager();
  const ride = manager.createRide({
    passengerClientId: 'p_2',
    pickup: { lat: 10, lng: -66 },
    dropoff: { lat: 10.1, lng: -66.1 },
    vehicleType: VEHICLE_TYPES.CARRO_STANDARD,
    fareUsd: 5.0,
    fareBs: 270.0,
    bcvRate: 54.0,
    distanceKm: 4.0,
    estimatedMinutes: 12
  });

  const cancelled = manager.cancelRide(ride.id, 'Cambié de planes');
  assert.equal(cancelled.status, RIDE_STATUS.CANCELLED);
  assert.equal(cancelled.cancelReason, 'Cambié de planes');
});
