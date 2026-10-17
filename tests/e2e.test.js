import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import { WebSocket } from 'ws';
import { app, server, rideManager } from '../src/server/server.js';
import { VEHICLE_TYPES, PAYMENT_METHODS, RIDE_STATUS } from '../src/shared/constants.js';

test('E2E: Flujo completo de solicitud, aceptación y liquidación por WebSocket', async () => {
  const port = 3099;

  await new Promise((resolve) => {
    server.listen(port, resolve);
  });

  const baseUrl = `http://127.0.0.1:${port}`;
  const wsUrl = `ws://127.0.0.1:${port}/ws`;

  try {
    // 1. Health check HTTP
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    assert.equal(healthData.status, 'ok');

    // 2. Consulta de tasa BCV HTTP
    const bcvRes = await fetch(`${baseUrl}/api/bcv`);
    const bcvData = await bcvRes.json();
    assert.ok(bcvData.rate > 0);

    // 3. Conexión de Conductor y Pasajero por WebSocket
    const driverWs = new WebSocket(wsUrl);
    const passengerWs = new WebSocket(wsUrl);

    await Promise.all([
      new Promise((res) => driverWs.on('open', res)),
      new Promise((res) => passengerWs.on('open', res))
    ]);

    // Inicializar roles
    driverWs.send(JSON.stringify({
      event: 'client:init',
      data: {
        role: 'driver',
        meta: {
          driverId: 'drv_test_1',
          name: 'Franklin Rivas',
          vehicleType: VEHICLE_TYPES.MOTO,
          plate: 'AB123CD'
        }
      }
    }));

    passengerWs.send(JSON.stringify({
      event: 'client:init',
      data: { role: 'passenger', meta: { name: 'Pasajero E2E' } }
    }));

    // Esperar suscripción
    await new Promise((r) => setTimeout(r, 100));

    // 4. Pasajero solicita viaje
    let createdRideId = null;

    const offerPromise = new Promise((resolve) => {
      driverWs.on('message', (raw) => {
        const msg = JSON.parse(raw);
        if (msg.event === 'ride:new_offer') {
          resolve(msg.data);
        }
      });
    });

    passengerWs.send(JSON.stringify({
      event: 'passenger:request_ride',
      data: {
        pickup: { name: 'Plaza Venezuela', lat: 10.4965, lng: -66.8835 },
        dropoff: { name: 'Plaza Altamira', lat: 10.4969, lng: -66.8523 },
        vehicleType: VEHICLE_TYPES.MOTO,
        fareUsd: 2.50,
        fareBs: 135.50,
        bcvRate: 54.20,
        distanceKm: 3.4,
        estimatedMinutes: 8
      }
    }));

    const offer = await offerPromise;
    assert.ok(offer.id);
    createdRideId = offer.id;
    assert.equal(offer.fareUsd, 2.50);

    // 5. Conductor acepta la carrera
    const acceptedPromise = new Promise((resolve) => {
      passengerWs.on('message', (raw) => {
        const msg = JSON.parse(raw);
        if (msg.event === 'ride:accepted') {
          resolve(msg.data);
        }
      });
    });

    driverWs.send(JSON.stringify({
      event: 'driver:accept_ride',
      data: { rideId: createdRideId, driverId: 'drv_test_1' }
    }));

    const acceptedRide = await acceptedPromise;
    assert.equal(acceptedRide.status, RIDE_STATUS.ACCEPTED);
    assert.equal(acceptedRide.driver.name, 'Franklin Rivas');

    // 6. Conductor actualiza estados: LLEGÓ -> EN CURSO -> COMPLETADO
    driverWs.send(JSON.stringify({
      event: 'ride:update_status',
      data: { rideId: createdRideId, status: RIDE_STATUS.ARRIVED }
    }));
    await new Promise((r) => setTimeout(r, 60));

    driverWs.send(JSON.stringify({
      event: 'ride:update_status',
      data: { rideId: createdRideId, status: RIDE_STATUS.IN_PROGRESS }
    }));
    await new Promise((r) => setTimeout(r, 60));

    driverWs.send(JSON.stringify({
      event: 'ride:update_status',
      data: { rideId: createdRideId, status: RIDE_STATUS.COMPLETED }
    }));
    await new Promise((r) => setTimeout(r, 60));

    // 7. Pasajero reporta Pago Móvil
    const paymentReportPromise = new Promise((resolve) => {
      driverWs.on('message', (raw) => {
        const msg = JSON.parse(raw);
        if (msg.event === 'ride:payment_submitted') {
          resolve(msg.data);
        }
      });
    });

    passengerWs.send(JSON.stringify({
      event: 'passenger:submit_payment',
      data: {
        rideId: createdRideId,
        payment: {
          method: PAYMENT_METHODS.PAGO_MOVIL,
          senderBank: '0102',
          senderPhone: '04121234567',
          reference: '839201',
          amountBs: 135.50
        }
      }
    }));

    const paymentNotification = await paymentReportPromise;
    assert.equal(paymentNotification.payment.reference, '839201');

    // 8. Conductor confirma el pago recibido
    const paidPromise = new Promise((resolve) => {
      passengerWs.on('message', (raw) => {
        const msg = JSON.parse(raw);
        if (msg.event === 'ride:completed_and_paid') {
          resolve(msg.data);
        }
      });
    });

    driverWs.send(JSON.stringify({
      event: 'driver:confirm_payment',
      data: { rideId: createdRideId, driverId: 'drv_test_1' }
    }));

    const finalRide = await paidPromise;
    assert.equal(finalRide.status, RIDE_STATUS.PAID);
    assert.ok(finalRide.paymentConfirmedAt > 0);

    // Cerrar WebSockets
    driverWs.close();
    passengerWs.close();
  } finally {
    await new Promise((res) => server.close(res));
  }
});
