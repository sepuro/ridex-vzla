# Spec: RideX Venezuela (PanaRide) — Plataforma de Transporte Bajo Demanda

## Objective
Desarrollar una aplicación de movilidad bajo demanda (estilo Uber/Ridery) completamente funcional, intuitiva, minimalista y mobile-first para teléfonos Android, adaptada al ecosistema y la realidad operativa de Venezuela.

La plataforma permite:
1. **Pasajeros:** Solicitar viajes en Carro o Moto, calcular tarifas en USD y Bolívares (tasa BCV), dar seguimiento al conductor en tiempo real sobre mapa interactivo, y pagar con métodos venezolanos (Pago Móvil, Efectivo USD con vuelto, Binance Pay / Zelle).
2. **Conductores:** Conectarse/desconectarse, recibir solicitudes de viaje entrantes con ruta y tarifa estimada, aceptar viajes, navegar hacia el pasajero y confirmar la recepción del pago.
3. **Adaptación a Venezuela:**
   - Moneda dual: Visualización simultánea en USD ($) y Bolívares (Bs.) con tasa de cambio oficial BCV configurable o actualizable.
   - Tipos de vehículos locales: Moto Express (ágil, económico), Carro Estándar y Carro Confort (con aire acondicionado garantizado).
   - Pasarela de pago venezolana: Registro y validación de Pago Móvil (banco destino, teléfono, cédula y referencia bancaria de 4-6 dígitos) y efectivo USD (indicando denominación del billete para cálculo del vuelto exacto).
   - Conectividad optimizada: Interfaz ligera compatible con conexiones móviles 3G/4G, mapas Leaflet/OpenStreetMap sin consumo de cuotas comerciales de Google Maps.
   - PWA para Android: Instalable en la pantalla de inicio con apariencia y comportamiento de app nativa (sin barras de navegador, pantalla completa, gestos táctiles, vibración háptica).

---

## Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS, Lucide React (iconos modernos y limpios), Leaflet & OpenStreetMap (mapas interactivos ligeros).
- **Backend / Realtime:** Node.js, Express, WebSockets (`ws`) para sincronización bidireccional en tiempo real entre pasajeros y conductores.
- **PWA:** Web App Manifest (`manifest.json`), Service Worker (caching de recursos estáticos y funcionamiento autónomo en pantalla completa).
- **Base de Datos / Estado:** Almacenamiento en memoria con persistencia en JSON / SQLite ligero para gestión de usuarios, viajes, historial y configuración de tasas.
- **Testing:** Vitest / Node test runner para cálculo de tarifas, validación de referencias bancarias y ciclo de vida de los viajes.

---

## Commands
```bash
# Instalación de dependencias
npm install

# Ejecución en modo desarrollo (Cliente + Servidor WebSocket)
npm run dev

# Ejecución de pruebas unitarias y de integración
npm test

# Compilación para producción (PWA optimizada)
npm run build

# Inicio del servidor de producción
npm start
```

---

## Project Structure
```
ridex-vzla/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── index.html
├── public/
│   ├── manifest.json
│   ├── sw.js
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
├── src/
│   ├── client/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── Header.jsx              # Barra superior con selector de rol y tasa BCV
│   │   │   ├── MapView.jsx             # Mapa Leaflet interactivo (origen, destino, conductor)
│   │   │   ├── VehicleSelector.jsx     # Tarjetas de selección (Moto, Carro Estándar, Confort)
│   │   │   ├── PaymentModal.jsx        # Pago Móvil (Bancos, Cédula, Ref) y Efectivo (Vuelto)
│   │   │   ├── RideStatusCard.jsx      # Estado en tiempo real del viaje (Buscando, Asignado, En curso)
│   │   │   ├── DriverDashboard.jsx     # Panel del conductor (Aceptar viajes, radar, ganancias)
│   │   │   └── RateSettingsModal.jsx   # Configuración de tasa BCV y comisiones
│   │   ├── hooks/
│   │   │   ├── useGeolocation.js       # Hook para GPS del teléfono Android
│   │   │   └── useRideSocket.js        # Cliente WebSocket para eventos en tiempo real
│   │   └── utils/
│   │       ├── pricing.js              # Cálculo de tarifas por distancia, tipo de vehículo y tasa BCV
│   │       ├── banks.js                # Catálogo oficial de bancos de Venezuela (código, nombre)
│   │       └── formatters.js           # Formateo de montos en Bs. y USD
│   ├── server/
│   │   ├── server.js                   # Servidor Express + WebSocket Server
│   │   ├── rideManager.js              # Máquina de estados del viaje y despacho
│   │   └── bcvService.js               # Servicio de cotización de tasa BCV
│   └── shared/
│       └── constants.js                # Estados de viaje, tipos de pago, vehículos
└── tests/
    ├── pricing.test.js                 # Pruebas de cálculo de tarifas y conversión BCV
    ├── paymentValidation.test.js       # Pruebas de validación de Pago Móvil y efectivo
    └── rideLifecycle.test.js           # Pruebas de transición de estados de viaje
```

---

## Code Style & Conventions
- **Arquitectura de Componentes:** Componentes funcionales limpios con React Hooks. Separación estricta de lógica de negocio en `utils/` y estado en `hooks/`.
- **Diseño Visual:** Minimalista y llamativo. Paleta oscura elegante (`#0B0F17`, `#161F30`) combinada con blanco puro y acento Verde Esmeralda Eléctrico (`#10B981`) y Amarillo Neón (`#F59E0B`). Tipografía con excelente legibilidad en pantallas AMOLED.
- **Optimización Móvil Android:**
  - Áreas táctiles mínimas de 48x48px.
  - Safe-areas para cámaras frontales ("notch") y barras de navegación de Android.
  - Haptic feedback (vibración del teléfono vía `navigator.vibrate`) al recibir o aceptar carreras.
  - Notificaciones acústicas sutiles al cambiar de estado.
- **Ejemplo de Código (Cálculo de Tarifas con Tasa BCV):**
```javascript
export function calculateFare({ distanceKm, vehicleType, bcvRate }) {
  const RATES = {
    moto: { base: 1.5, perKm: 0.7, minFare: 2.0 },
    carro_standard: { base: 2.5, perKm: 1.1, minFare: 3.5 },
    carro_confort: { base: 4.0, perKm: 1.5, minFare: 5.0 }
  };

  const config = RATES[vehicleType] || RATES.carro_standard;
  const rawUsd = config.base + (distanceKm * config.perKm);
  const fareUsd = Math.max(config.minFare, Math.round(rawUsd * 10) / 10);
  const fareBs = Math.round(fareUsd * bcvRate * 100) / 100;

  return { fareUsd, fareBs, bcvRate };
}
```

---

## Testing Strategy
1. **Pruebas Unitarias:**
   - Cálculo de tarifa para cada tipo de vehículo según kilómetros.
   - Conversión precisa de montos según la tasa oficial del BCV.
   - Validación de formato de teléfono venezolano (`0414`, `0424`, `0412`, `0416`, `0426`) y longitud de referencia de Pago Móvil.
2. **Pruebas de Integración:**
   - Ciclo de vida del viaje: `REQUESTED` → `OFFERED_TO_DRIVER` → `ACCEPTED` → `IN_PROGRESS` → `COMPLETED` → `PAID`.
   - Conexión y reconexión de WebSocket para pasajeros y conductores.
3. **Verificación en Runtime:**
   - Carga en navegador móvil Android con emulación de pantalla táctil y geolocalización.
   - Verificación de instalación PWA en Android.

---

## Boundaries
- **Siempre:**
  - Mostrar el precio en ambas monedas (USD y Bs. al cambio BCV) de forma clara y visible.
  - Validar datos de Pago Móvil (banco emisor, teléfono, cédula y referencia bancaria).
  - Diseñar con targets táctiles amigables con el pulgar en móviles.
  - Permitir simulación GPS y selección manual en mapa para pruebas inmediatas en cualquier ciudad de Venezuela (ej. Caracas, Valencia, Maracaibo, Barquisimeto).
- **Consultar primero:**
  - Añadir librerías externas pesadas que puedan degradar la velocidad en redes móviles lentas.
  - Modificar las reglas o porcentajes de comisión de la plataforma.
- **Nunca:**
  - Requerir tarjeta de crédito internacional para el uso de la aplicación.
  - Bloquear el funcionamiento de la app si el usuario no tiene conexión de alta velocidad.
  - Usar APIs de pago que no operen legal y técnicamente en Venezuela.

---

## Success Criteria
1. **Flujo Pasajero 100% operativo:**
   - Fijar origen y destino en el mapa (vía GPS o tocando el mapa).
   - Ver ruta trazada, distancia en kilómetros y tiempo estimado.
   - Elegir entre Moto, Carro Estándar o Carro Confort.
   - Visualizar la tarifa en USD y en Bs.
   - Presionar "Solicitar RideX".
2. **Flujo Conductor 100% operativo:**
   - Activar modo "En Línea".
   - Recibir solicitud entrante en tiempo real con tarjeta flotante, sonido y vibración.
   - Aceptar la carrera y ver la ruta hacia el pasajero.
   - Actualizar estado: "Llegué al origen", "Iniciar viaje", "Finalizar viaje".
3. **Módulo de Cobro/Pago Venezolano:**
   - Pasajero registra su pago:
     - Pago Móvil: Selecciona banco, ingresa cédula, teléfono y número de referencia.
     - Efectivo USD: Selecciona denominación (ej. billete de $10 o $20) y la app calcula el vuelto exacto que el conductor debe entregar.
   - Conductor visualiza los datos del pago y confirma la recepción para liberar el viaje.
4. **PWA Android:**
   - Manifiesto completo, iconos configurados e instalable en la pantalla de inicio de Android.
5. **Suite de pruebas:**
   - Todas las pruebas unitarias y de integración pasando en verde (`npm test`).

---

## Open Questions
1. **Alerta sonora para conductores:** ¿Deseas activar sonido tipo campanada o 'beep' cuando entra una solicitud para el conductor? (Recomendado: Sí, configurable con botón de silencio).
2. **Actualización de Tasa BCV:** ¿Prefieres que la tasa BCV se actualice automáticamente vía API pública o que además tenga un control manual para que el operador pueda ajustarla al instante? (Recomendado: Automática con opción de ajuste manual directo).
