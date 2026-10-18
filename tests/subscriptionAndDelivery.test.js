import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../src/server/db/database.js';
import { RideManager } from '../src/server/rideManager.js';
import { calculateFare } from '../src/client/utils/pricing.js';
import { VEHICLE_TYPES, SUBSCRIPTION_PLANS, DELIVERY_CATEGORIES } from '../src/shared/constants.js';

test('Pricing: Aplica descuento RideX Pass VIP del 15% correctamente', () => {
  const regular = calculateFare({
    distanceKm: 10,
    vehicleType: VEHICLE_TYPES.CARRO_STANDARD,
    bcvRate: 880,
    isVip: false
  });

  const vip = calculateFare({
    distanceKm: 10,
    vehicleType: VEHICLE_TYPES.CARRO_STANDARD,
    bcvRate: 880,
    isVip: true,
    vipDiscountPercent: 15
  });

  assert.equal(vip.isVip, true);
  assert.ok(vip.fareUsd < regular.fareUsd, 'La tarifa VIP debe ser menor que la regular');
  assert.equal(vip.regularFareUsd, regular.fareUsd);
  assert.ok(vip.savingsUsd > 0, 'El ahorro en USD debe ser mayor a 0');
  assert.ok(vip.savingsBs > 0, 'El ahorro en Bs debe ser mayor a 0');
  assert.equal(vip.fareBs, Math.round(vip.fareUsd * 880 * 100) / 100);
});

test('Pricing: Calcula correctamente tarifas de delivery para distintas capacidades', () => {
  const motoDelivery = calculateFare({
    distanceKm: 5,
    vehicleType: VEHICLE_TYPES.DELIVERY_MOTO,
    bcvRate: 880
  });

  const cargaDelivery = calculateFare({
    distanceKm: 5,
    vehicleType: VEHICLE_TYPES.DELIVERY_CARGA,
    bcvRate: 880
  });

  assert.ok(motoDelivery.fareUsd < cargaDelivery.fareUsd, 'Moto delivery debe ser más económica que camioneta de carga');
  assert.ok(motoDelivery.fareUsd >= 1.8, 'Debe respetar la tarifa mínima');
  assert.ok(cargaDelivery.fareUsd >= 7.5, 'Camioneta de carga debe respetar su tarifa mínima');
});

test('Database: Suscripción y cancelación de RideX Pass VIP', () => {
  // Mariana Silva demo user
  const userId = 'usr_demo_mariana';
  
  // Suscribir al plan mensual
  const userVip = db.subscribeUser(userId, SUBSCRIPTION_PLANS.MONTHLY.id);
  assert.equal(userVip.isVip, true);
  assert.equal(userVip.subscription.status, 'active');
  assert.equal(userVip.subscription.planId, 'pass_vip_monthly');
  assert.equal(userVip.subscription.discountPercent, 15);
  assert.ok(new Date(userVip.subscription.expiresAt).getTime() > Date.now());

  // Cancelar suscripción
  const userCancelled = db.cancelSubscription(userId);
  assert.equal(userCancelled.isVip, false);
  assert.equal(userCancelled.subscription.status, 'cancelled');
  assert.equal(userCancelled.subscription.autoRenew, false);
});

test('RideManager: Despacho de servicio de Delivery con detalles de paquete y PIN', () => {
  const rm = new RideManager();
  
  const packageInfo = {
    category: 'electronics',
    receiverName: 'Carlos Gómez',
    receiverPhone: '04141234567',
    notes: 'Entregar en recepción Torre Banco de Venezuela',
    deliveryPin: '5821'
  };

  const deliveryRide = rm.createRide({
    passengerClientId: 'client_p1',
    passengerName: 'Mariana Silva',
    passengerPhone: '04142345678',
    pickup: { lat: 10.491, lng: -66.872, address: 'Chacao, Caracas' },
    dropoff: { lat: 10.505, lng: -66.914, address: 'Centro de Caracas' },
    vehicleType: VEHICLE_TYPES.DELIVERY_MOTO,
    fareUsd: 4.5,
    fareBs: 3960.0,
    bcvRate: 880,
    distanceKm: 6.2,
    estimatedMinutes: 18,
    serviceMode: 'delivery',
    packageDetails: packageInfo,
    isVip: true
  });

  assert.ok(deliveryRide.id.startsWith('RX-'));
  assert.equal(deliveryRide.serviceMode, 'delivery');
  assert.equal(deliveryRide.isVip, true);
  assert.deepEqual(deliveryRide.packageDetails, packageInfo);
  assert.equal(deliveryRide.packageDetails.deliveryPin, '5821');
});
