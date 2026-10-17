import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { WebSocketServer } from 'ws';
import { RideManager } from './rideManager.js';
import { bcvService } from './bcvService.js';
import { VEHICLE_TYPES } from '../shared/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(express.json());

// Servir archivos estáticos del frontend (dist o public)
const distPath = path.resolve(__dirname, '../../dist');
const publicPath = path.resolve(__dirname, '../../public');
app.use(express.static(distPath));
app.use(express.static(publicPath));

const rideManager = new RideManager();

// Inicializar conductores de demostración para Caracas (uno para moto, uno para carro)
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

rideManager.drivers.set('drv_demo_carro', {
  driverId: 'drv_demo_carro',
  clientId: null,
  name: 'Franklin Rivas',
  phone: '04141239876',
  vehicleType: VEHICLE_TYPES.CARRO_STANDARD,
  plate: 'AE430KK',
  model: 'Chevrolet Optra',
  color: 'Plata',
  rating: 4.89,
  totalRides: 540,
  isOnline: true,
  location: { lat: 10.4980, lng: -66.8600 },
  activeRideId: null
});

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'RideX Venezuela Backend',
    uptime: process.uptime(),
    activeConnections: rideManager.clients.size,
    activeRides: rideManager.getActiveRides().length
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
