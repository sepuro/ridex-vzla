import { RIDE_STATUS, VEHICLE_TYPES } from '../shared/constants.js';

export class RideManager {
  constructor() {
    this.rides = new Map(); // rideId -> ride
    this.drivers = new Map(); // driverId -> driver
    this.clients = new Map(); // clientId -> { ws, role, userId, meta }
    this.rideCounter = 1000;
  }

  // --- Gestión de conexiones WebSocket ---
  registerClient(clientId, ws, role = 'passenger', meta = {}) {
    this.clients.set(clientId, { ws, role, meta });

    // Si es conductor, registrar en la lista de conductores
    if (role === 'driver') {
      const driverId = meta.driverId || clientId;
      if (!this.drivers.has(driverId)) {
        this.drivers.set(driverId, {
          driverId,
          clientId,
          name: meta.name || 'Conductor RideX',
          phone: meta.phone || '04121234567',
          vehicleType: meta.vehicleType || VEHICLE_TYPES.MOTO,
          plate: meta.plate || 'AB123CD',
          model: meta.model || 'Bera Socialista 150',
          color: meta.color || 'Negro',
          rating: 4.95,
          totalRides: 48,
          isOnline: true,
          location: meta.location || { lat: 10.4965, lng: -66.8835 },
          activeRideId: null
        });
      } else {
        const d = this.drivers.get(driverId);
        d.clientId = clientId;
        d.isOnline = true;
      }
    }
  }

  unregisterClient(clientId) {
    const client = this.clients.get(clientId);
    if (client && client.role === 'driver') {
      const driverId = client.meta.driverId || clientId;
      const driver = this.drivers.get(driverId);
      if (driver) {
        driver.isOnline = false;
      }
    }
    this.clients.delete(clientId);
  }

  sendToClient(clientId, event, data) {
    const client = this.clients.get(clientId);
    if (client && client.ws && client.ws.readyState === 1 /* OPEN */) {
      try {
        client.ws.send(JSON.stringify({ event, data, timestamp: Date.now() }));
      } catch (err) {
        console.error(`Error enviando mensaje a cliente ${clientId}:`, err.message);
      }
    }
  }

  broadcastToRole(role, event, data) {
    for (const [cId, client] of this.clients.entries()) {
      if (client.role === role) {
        this.sendToClient(cId, event, data);
      }
    }
  }

  broadcast(event, data) {
    for (const cId of this.clients.keys()) {
      this.sendToClient(cId, event, data);
    }
  }

  // --- Ciclo de Vida del Viaje ---

  createRide({
    passengerClientId,
    passengerName = 'Pasajero',
    passengerPhone = '04149998877',
    pickup,
    dropoff,
    vehicleType,
    fareUsd,
    fareBs,
    bcvRate,
    distanceKm,
    estimatedMinutes
  }) {
    this.rideCounter += 1;
    const rideId = `RX-${this.rideCounter}`;

    const newRide = {
      id: rideId,
      passengerClientId,
      passengerName,
      passengerPhone,
      pickup,
      dropoff,
      vehicleType,
      fareUsd: Number(fareUsd),
      fareBs: Number(fareBs),
      bcvRate: Number(bcvRate),
      distanceKm: Number(distanceKm),
      estimatedMinutes: Number(estimatedMinutes),
      status: RIDE_STATUS.SEARCHING,
      driverId: null,
      driver: null,
      payment: null,
      rating: null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.rides.set(rideId, newRide);

    // Notificar al pasajero confirmación de solicitud
    this.sendToClient(passengerClientId, 'ride:created', newRide);

    // Notificar a todos los conductores en línea del tipo de vehículo solicitado
    this.broadcastToRole('driver', 'ride:new_offer', newRide);

    return newRide;
  }

  acceptRide(rideId, driverId) {
    const ride = this.rides.get(rideId);
    if (!ride) throw new Error('Viaje no encontrado');
    if (ride.status !== RIDE_STATUS.SEARCHING) {
      throw new Error(`El viaje ya no está disponible (Estado: ${ride.status})`);
    }

    const driver = this.drivers.get(driverId);
    if (!driver) throw new Error('Conductor no encontrado');

    ride.status = RIDE_STATUS.ACCEPTED;
    ride.driverId = driverId;
    ride.driver = {
      driverId: driver.driverId,
      name: driver.name,
      phone: driver.phone,
      vehicleType: driver.vehicleType,
      plate: driver.plate,
      model: driver.model,
      color: driver.color,
      rating: driver.rating,
      location: driver.location
    };
    ride.updatedAt = Date.now();
    driver.activeRideId = rideId;

    // Notificar al pasajero que su viaje fue aceptado
    this.sendToClient(ride.passengerClientId, 'ride:accepted', ride);

    // Notificar al conductor que tomó la carrera
    this.sendToClient(driver.clientId, 'ride:assigned', ride);

    // Notificar al resto de conductores para retirar la oferta de su pantalla
    this.broadcastToRole('driver', 'ride:taken', { rideId });

    return ride;
  }

  updateDriverLocation(driverId, location) {
    const driver = this.drivers.get(driverId);
    if (!driver) return null;

    driver.location = location;

    // Si tiene viaje activo, notificar al pasajero en tiempo real
    if (driver.activeRideId) {
      const ride = this.rides.get(driver.activeRideId);
      if (ride && ride.passengerClientId) {
        this.sendToClient(ride.passengerClientId, 'driver:location_update', {
          rideId: ride.id,
          driverId,
          location
        });
      }
    }

    return driver;
  }

  updateRideStatus(rideId, newStatus) {
    const ride = this.rides.get(rideId);
    if (!ride) throw new Error('Viaje no encontrado');

    ride.status = newStatus;
    ride.updatedAt = Date.now();

    // Notificar a pasajero
    if (ride.passengerClientId) {
      this.sendToClient(ride.passengerClientId, 'ride:status_changed', ride);
    }

    // Notificar a conductor
    if (ride.driverId) {
      const driver = this.drivers.get(ride.driverId);
      if (driver && driver.clientId) {
        this.sendToClient(driver.clientId, 'ride:status_changed', ride);
      }
    }

    return ride;
  }

  submitPayment(rideId, paymentDetails) {
    const ride = this.rides.get(rideId);
    if (!ride) throw new Error('Viaje no encontrado');

    ride.payment = {
      ...paymentDetails,
      submittedAt: Date.now()
    };
    ride.updatedAt = Date.now();

    // Notificar al conductor para que verifique la referencia o el efectivo
    if (ride.driverId) {
      const driver = this.drivers.get(ride.driverId);
      if (driver && driver.clientId) {
        this.sendToClient(driver.clientId, 'ride:payment_submitted', ride);
      }
    }

    // Actualizar al pasajero
    this.sendToClient(ride.passengerClientId, 'ride:payment_pending_confirmation', ride);

    return ride;
  }

  confirmPayment(rideId, driverId) {
    const ride = this.rides.get(rideId);
    if (!ride) throw new Error('Viaje no encontrado');

    ride.status = RIDE_STATUS.PAID;
    ride.paymentConfirmedAt = Date.now();
    ride.updatedAt = Date.now();

    const driver = this.drivers.get(driverId);
    if (driver) {
      driver.activeRideId = null;
      driver.totalRides += 1;
    }

    // Notificar a ambos que el pago fue recibido satisfactoriamente
    if (ride.passengerClientId) {
      this.sendToClient(ride.passengerClientId, 'ride:completed_and_paid', ride);
    }
    if (driver && driver.clientId) {
      this.sendToClient(driver.clientId, 'ride:completed_and_paid', ride);
    }

    return ride;
  }

  cancelRide(rideId, reason = 'Cancelado por el usuario') {
    const ride = this.rides.get(rideId);
    if (!ride) return null;

    ride.status = RIDE_STATUS.CANCELLED;
    ride.cancelReason = reason;
    ride.updatedAt = Date.now();

    if (ride.driverId) {
      const driver = this.drivers.get(ride.driverId);
      if (driver) {
        driver.activeRideId = null;
        if (driver.clientId) {
          this.sendToClient(driver.clientId, 'ride:cancelled', { rideId, reason });
        }
      }
    }

    if (ride.passengerClientId) {
      this.sendToClient(ride.passengerClientId, 'ride:cancelled', { rideId, reason });
    }

    // Notificar a conductores que se retiró la oferta
    this.broadcastToRole('driver', 'ride:taken', { rideId });

    return ride;
  }

  getRide(rideId) {
    return this.rides.get(rideId) || null;
  }

  getActiveRides() {
    return Array.from(this.rides.values()).filter(r => 
      r.status !== RIDE_STATUS.PAID && r.status !== RIDE_STATUS.CANCELLED
    );
  }
}
