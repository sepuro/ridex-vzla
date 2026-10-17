import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { WebSocketServer } from 'ws';
import { RideManager } from './rideManager.js';
import { bcvService } from './bcvService.js';
import { db } from './db/database.js';
import { VEHICLE_TYPES } from '../shared/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(express.json({ limit: '15mb' }));

// Servir archivos estáticos del frontend (dist o public)
const distPath = path.resolve(__dirname, '../../dist');
const publicPath = path.resolve(__dirname, '../../public');
app.use(express.static(distPath));
app.use(express.static(publicPath));

const rideManager = new RideManager();

// Notificar automáticamente a todos los clientes por WebSocket cuando cambie la tasa oficial BCV
bcvService.onRateChanged = (rateData) => {
  rideManager.broadcast('bcv:updated', rateData);
};

// Cargar y sincronizar conductores registrados en la base de datos persistente
for (const drv of db.getAllDrivers()) {
  rideManager.drivers.set(drv.id, {
    driverId: drv.id,
    clientId: null,
    name: drv.name,
    phone: drv.phone,
    vehicleType: drv.vehicle?.vehicleType || VEHICLE_TYPES.MOTO,
    plate: drv.vehicle?.plate || 'AC881ZZ',
    model: drv.vehicle?.model || 'Bera SBR 150',
    color: drv.vehicle?.color || 'Rojo',
    rating: drv.rating || 4.97,
    totalRides: drv.totalRides || 0,
    isOnline: true,
    location: { lat: 10.4950, lng: -66.8810 },
    activeRideId: null
  });
}

// Inicializar conductor de demostración adicional para pruebas
if (!rideManager.drivers.has('drv_demo_moto')) {
  rideManager.drivers.set('drv_demo_moto', {
    driverId: 'drv_demo_moto',
    clientId: null,
    name: 'Alejandro Colmenares',
    phone: '04127654321',
    vehicleType: VEHICLE_TYPES.MOTO,
    plate: 'AC881ZZ',
    model: 'Empire Keeway Express 150',
    color: 'Azul',
    rating: 4.96,
    totalRides: 312,
    isOnline: true,
    location: { lat: 10.4950, lng: -66.8810 },
    activeRideId: null
  });
}

// --- API REST Endpoints ---

// Obtener tasa oficial BCV
app.get('/api/bcv', async (req, res) => {
  try {
    const data = bcvService.getRate();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Forzar actualización o ajuste manual de tasa BCV
app.post('/api/bcv', (req, res) => {
  const { rate } = req.body;
  try {
    const updated = bcvService.setManualRate(rate);
    // Notificar a todos los clientes conectados por WebSocket del cambio de tasa
    rideManager.broadcast('bcv:updated', updated);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Refrescar tasa en vivo desde la fuente externa
app.post('/api/bcv/refresh', async (req, res) => {
  try {
    const updated = await bcvService.fetchLiveRate();
    rideManager.broadcast('bcv:updated', updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener lista de viajes activos
app.get('/api/rides/active', (req, res) => {
  res.json(rideManager.getActiveRides());
});

// Obtener información de un viaje
app.get('/api/rides/:id', (req, res) => {
  const ride = rideManager.getRide(req.params.id);
  if (!ride) return res.status(404).json({ error: 'Viaje no encontrado' });
  res.json(ride);
});

// Obtener lista de conductores disponibles
app.get('/api/drivers', (req, res) => {
  res.json(Array.from(rideManager.drivers.values()));
});

// --- Rutas de Autenticación y Registro de Usuarios ---

app.post('/api/auth/register', (req, res) => {
  try {
    const { user, token } = db.createUser(req.body);

    // Si se registra como conductor, integrarlo de inmediato al pool activo
    if (user.role === 'driver') {
      rideManager.drivers.set(user.id, {
        driverId: user.id,
        clientId: null,
        name: user.name,
        phone: user.phone,
        vehicleType: user.vehicle?.vehicleType || VEHICLE_TYPES.MOTO,
        plate: user.vehicle?.plate || 'AC881ZZ',
        model: user.vehicle?.model || 'Bera SBR 150',
        color: user.vehicle?.color || 'Rojo',
        rating: user.rating || 5.0,
        totalRides: user.totalRides || 0,
        isOnline: true,
        location: { lat: 10.4950, lng: -66.8810 },
        activeRideId: null
      });
    }

    res.status(201).json({ success: true, user, token });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { identifier, password } = req.body;
    const { user, token } = db.authenticateUser(identifier, password);

    if (user.role === 'driver' && !rideManager.drivers.has(user.id)) {
      rideManager.drivers.set(user.id, {
        driverId: user.id,
        clientId: null,
        name: user.name,
        phone: user.phone,
        vehicleType: user.vehicle?.vehicleType || VEHICLE_TYPES.MOTO,
        plate: user.vehicle?.plate || 'AC881ZZ',
        model: user.vehicle?.model || 'Bera SBR 150',
        color: user.vehicle?.color || 'Rojo',
        rating: user.rating || 4.97,
        totalRides: user.totalRides || 0,
        isOnline: true,
        location: { lat: 10.4950, lng: -66.8810 },
        activeRideId: null
      });
    }

    res.json({ success: true, user, token });
  } catch (err) {
    res.status(401).json({ success: false, error: err.message });
  }
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : req.query.token;
  if (!token) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const user = db.getUserByToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Sesión no encontrada o expirada' });
  }

  res.json({ success: true, user });
});

app.put('/api/auth/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : req.query.token;
  const user = db.getUserByToken(token);
  if (!user) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const updatedUser = db.updateUser(user.id, req.body);
    if (updatedUser.role === 'driver') {
      const driver = rideManager.drivers.get(user.id);
      if (driver) {
        driver.name = updatedUser.name;
        driver.phone = updatedUser.phone;
        if (updatedUser.vehicle) {
          driver.model = updatedUser.vehicle.model;
          driver.plate = updatedUser.vehicle.plate;
          driver.color = updatedUser.vehicle.color;
          driver.vehicleType = updatedUser.vehicle.vehicleType;
        }
      }
    }
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/avatar', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : req.query.token;
  const user = db.getUserByToken(token);
  if (!user) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const { avatar } = req.body;
  if (!avatar) {
    return res.status(400).json({ error: 'Avatar requerido' });
  }

  const updatedUser = db.updateAvatar(user.id, avatar);
  res.json({ success: true, user: updatedUser });
});

app.get('/api/auth/users', (req, res) => {
  res.json(db.getAllUsers());
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'RideX Venezuela Backend',
    uptime: process.uptime(),
    activeConnections: rideManager.clients.size,
    activeRides: rideManager.getActiveRides().length,
    registeredUsers: db.getAllUsers().length
  });
});

// Fallback SPA para rutas de frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.sendFile(path.resolve(__dirname, '../../index.html'));
    }
  });
});

// --- Manejo de WebSockets en tiempo real ---

wss.on('connection', (ws) => {
  const clientId = 'c_' + Math.random().toString(36).substring(2, 9);

  ws.on('message', (message) => {
    try {
      const { event, data } = JSON.parse(message);

      switch (event) {
        case 'client:init': {
          rideManager.registerClient(clientId, ws, data.role, data.meta || {});
          // Enviar tasa actual al cliente recién conectado
          ws.send(JSON.stringify({
            event: 'bcv:current',
            data: bcvService.getRate()
          }));
          break;
        }

        case 'passenger:request_ride': {
          rideManager.createRide({
            passengerClientId: clientId,
            ...data
          });
          break;
        }

        case 'driver:set_online': {
          const client = rideManager.clients.get(clientId);
          if (client) {
            client.role = 'driver';
            const driverId = data.driverId || clientId;
            const driver = rideManager.drivers.get(driverId);
            if (driver) {
              driver.isOnline = Boolean(data.isOnline);
              driver.clientId = clientId;
            }
          }
          break;
        }

        case 'driver:accept_ride': {
          const { rideId, driverId } = data;
          try {
            rideManager.acceptRide(rideId, driverId || clientId);
          } catch (err) {
            ws.send(JSON.stringify({ event: 'error', data: { message: err.message } }));
          }
          break;
        }

        case 'driver:update_location': {
          const { driverId, location } = data;
          rideManager.updateDriverLocation(driverId || clientId, location);
          break;
        }

        case 'ride:update_status': {
          const { rideId, status } = data;
          rideManager.updateRideStatus(rideId, status);
          break;
        }

        case 'passenger:submit_payment': {
          const { rideId, payment } = data;
          rideManager.submitPayment(rideId, payment);
          break;
        }

        case 'driver:confirm_payment': {
          const { rideId, driverId } = data;
          rideManager.confirmPayment(rideId, driverId || clientId);
          break;
        }

        case 'ride:cancel': {
          const { rideId, reason } = data;
          rideManager.cancelRide(rideId, reason);
          break;
        }

        default:
          console.log(`Evento desconocido recibido: ${event}`);
      }
    } catch (err) {
      console.error('Error procesando mensaje WebSocket:', err);
    }
  });

  ws.on('close', () => {
    rideManager.unregisterClient(clientId);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor RideX Venezuela escuchando en http://localhost:${PORT}`);
  console.log(`📡 WebSocket listo en ws://localhost:${PORT}/ws`);
  // Cargar tasa en vivo al arrancar
  bcvService.fetchLiveRate();
});

export { app, server, rideManager };
