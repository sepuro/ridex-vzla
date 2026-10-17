# Task List: RideX Venezuela

## Phase 1: Foundation & Shared Domain

## Task 1: Setup del proyecto y dependencias base
**Description:** Inicializar el proyecto Node.js, configurar Vite, React 19, Tailwind CSS, Leaflet, Express, `ws` (WebSockets) y scripts de build y ejecución.
**Acceptance criteria:**
- [x] `package.json` con scripts `dev`, `build`, `start` y `test`.
- [x] Configuración de Tailwind CSS con paleta minimalista y moderna optimizada para móviles.
- [x] Estructura de carpetas creada según la especificación (`src/client`, `src/server`, `src/shared`, `public`, `tests`).
**Verification:**
- [x] `npm install` ejecuta sin errores.
- [x] `npx vite build --help` o `npm run build` valida la configuración.
**Dependencies:** None
**Files likely touched:**
- `package.json`
- `vite.config.js`
- `tailwind.config.js`
- `postcss.config.js`
- `index.html`
**Estimated scope:** Medium (4-5 files)

---

## Task 2: Módulo de tarifas, tasa BCV y catálogo de bancos de Venezuela
**Description:** Implementar la lógica matemática de cálculo de distancias (Haversine), tarifas por tipo de vehículo (Moto Express, Carro Estándar, Carro Confort), conversión automática a Bolívares usando la tasa BCV, y el catálogo oficial de bancos de Venezuela con validadores de teléfono venezolano y números de referencia.
**Acceptance criteria:**
- [x] `src/shared/constants.js`: Estados de viaje, tipos de vehículo y métodos de pago.
- [x] `src/utils/pricing.js`: Función `calculateFare({ distanceKm, vehicleType, bcvRate })` con tarifa mínima y redondeo adecuado.
- [x] `src/utils/banks.js`: Lista de 25+ bancos venezolanos (nombre, código) y funciones `validatePagoMovil({ phone, bankCode, idDoc, reference })`.
- [x] `tests/pricing.test.js`: Pruebas completas de cálculo y conversión BCV.
- [x] `tests/paymentValidation.test.js`: Pruebas de validación de Pago Móvil y cálculo de vuelto en dólares.
**Verification:**
- [x] Tests pasan: `node --test tests/*.test.js` (o `npm test`).
**Dependencies:** Task 1
**Files likely touched:**
- `src/shared/constants.js`
- `src/client/utils/pricing.js`
- `src/client/utils/banks.js`
- `src/client/utils/formatters.js`
- `tests/pricing.test.js`
- `tests/paymentValidation.test.js`
**Estimated scope:** Medium (5 files)

---

## Checkpoint: Foundation
- [x] Todas las pruebas de tarifas y validaciones bancarias pasan (`npm test`).
- [x] Módulos matemáticos y de dominio venezolano verificados.

---

## Phase 2: Backend & Realtime State Engine

## Task 3: Servidor Express y Motor de Despacho WebSocket
**Description:** Implementar el servidor Express con WebSocket (`ws`) y el gestor de viajes (`rideManager.js`) que maneja las transiciones de estado: solicitud, notificación a conductores conectados, aceptación, actualización de coordenadas en tiempo real y finalización.
**Acceptance criteria:**
- [x] `src/server/rideManager.js`: Gestión de viajes en memoria, conductores activos y asignación de carreras.
- [x] `src/server/server.js`: Servidor HTTP + WS con manejo de desconexiones y reconexiones limpias.
- [x] Eventos WS implementados: `passenger:request_ride`, `driver:online_status`, `driver:accept_ride`, `driver:update_location`, `driver:status_change`, `ride:update`.
- [x] `tests/rideLifecycle.test.js`: Prueba automatizada de transiciones de estado de viaje.
**Verification:**
- [x] Tests pasan: `node --test tests/rideLifecycle.test.js`.
- [x] Servidor arranca y responde en puerto HTTP y WebSocket.
**Dependencies:** Task 2
**Files likely touched:**
- `src/server/rideManager.js`
- `src/server/server.js`
- `src/server/bcvService.js`
- `tests/rideLifecycle.test.js`
**Estimated scope:** Medium (4 files)

---

## Task 4: Servicio de Tasa BCV y APIs de soporte
**Description:** Crear el servicio de tasa cambiaria BCV con caché local y endpoint para consulta/actualización manual o automática, y endpoints de estado del sistema.
**Acceptance criteria:**
- [x] Endpoint `GET /api/bcv` para obtener la tasa actual y fecha de actualización.
- [x] Endpoint `POST /api/bcv` para que un operador o conductor pueda actualizar la tasa manualmente si es necesario.
- [x] Endpoint `GET /api/health` para verificación de estado.
**Verification:**
- [x] Test con curl / petición HTTP a `/api/bcv` devuelve la tasa y formato correcto.
**Dependencies:** Task 3
**Files likely touched:**
- `src/server/bcvService.js`
- `src/server/server.js`
**Estimated scope:** Small (2 files)

---

## Checkpoint: Realtime Engine
- [x] Servidor WS sincroniza eventos entre dos clientes (pasajero y conductor) en tiempo real.
- [x] Pruebas del ciclo de vida del viaje pasan exitosamente.

---

## Phase 3: Mobile UI & Map Experience

## Task 5: Layout móvil Android, Header y Mapa Interactivo Leaflet
**Description:** Desarrollar la interfaz móvil minimalista y moderna con selector de rol (Pasajero/Conductor), badge de tasa BCV, y el componente de mapa interactivo con OpenStreetMap y Leaflet adaptado a pantallas táctiles.
**Acceptance criteria:**
- [x] `src/client/components/Header.jsx`: Switch rápido de rol (Pasajero / Conductor), badge interactivo de tasa BCV y estado de conexión en vivo.
- [x] `src/client/components/MapView.jsx`: Mapa Leaflet centrado en Venezuela (por defecto Caracas / configurable), marcadores personalizados para pasajero y conductor, trazo de ruta con polyline.
- [x] Soporte para GPS del teléfono móvil (`useGeolocation`) y toque en el mapa para fijar origen y destino.
- [x] Preset de puntos conocidos de la ciudad para selección rápida con 1 toque.
**Verification:**
- [x] Mapa renderiza correctamente en navegador móvil con controles táctiles fluidos.
**Dependencies:** Task 4
**Files likely touched:**
- `src/client/App.jsx`
- `src/client/components/Header.jsx`
- `src/client/components/MapView.jsx`
- `src/client/hooks/useGeolocation.js`
**Estimated scope:** Medium (4 files)

---

## Task 6: Flujo del Pasajero (Selector de Vehículos y Solicitud)
**Description:** Crear los componentes del pasajero para seleccionar tipo de vehículo (Moto Express, Carro Estándar, Carro Confort), ver cotización simultánea en USD y Bs., y solicitar la carrera con animación de búsqueda.
**Acceptance criteria:**
- [x] `src/client/components/VehicleSelector.jsx`: Tarjetas visuales de vehículo con icono, tiempo estimado, descripción (A/C en Confort) y precio en $ y Bs.
- [x] Estimación automática de distancia y costo según origen y destino seleccionados.
- [x] Botón principal flotante de acción rápida "Solicitar RideX".
- [x] `src/client/components/RideStatusCard.jsx`: Estado visual durante la búsqueda con animación de radar y botón de cancelar.
**Verification:**
- [x] Al seleccionar dos puntos en el mapa se recalculan inmediatamente los precios en $ y Bs. para cada vehículo.
**Dependencies:** Task 5
**Files likely touched:**
- `src/client/components/VehicleSelector.jsx`
- `src/client/components/RideStatusCard.jsx`
- `src/client/hooks/useRideSocket.js`
- `src/client/App.jsx`
**Estimated scope:** Medium (4 files)

---

## Checkpoint: Passenger Journey
- [x] El pasajero puede seleccionar ruta, elegir Moto o Carro, ver precio exacto en Bs. y USD, y enviar la solicitud.

---

## Phase 4: Driver Dashboard, Payments & PWA

## Task 7: Panel del Conductor (Radar, Alertas Sonoras y Navegación)
**Description:** Implementar la interfaz para el conductor de taxi o mototaxi: switch "En Línea", recepción de solicitudes en tiempo real con tarjeta flotante, cálculo de ganancia, sonido de alerta, vibración háptica y controles de estado ("Llegué", "Iniciar viaje", "Completar").
**Acceptance criteria:**
- [x] `src/client/components/DriverDashboard.jsx`: Vista del conductor con ganancias acumuladas del día, switch de disponibilidad y radar activo.
- [x] Notificación flotante de carrera entrante con ruta, distancia, vehículo y tarifa.
- [x] Alerta auditiva con sintetizador nativo (Web Audio API) y vibración (`navigator.vibrate`) en dispositivos Android compatibles.
- [x] Botón de "Aceptar Carrera" y botones secuenciales de avance del viaje.
**Verification:**
- [x] Cuando el pasajero solicita un viaje, aparece inmediatamente la alerta en el panel del conductor con sonido y vibración.
**Dependencies:** Task 6
**Files likely touched:**
- `src/client/components/DriverDashboard.jsx`
- `src/client/utils/soundEffects.js`
- `src/client/App.jsx`
**Estimated scope:** Medium (3 files)

---

## Task 8: Módulo de Pagos de Venezuela y Liquidación de Viaje
**Description:** Implementar el modal de pago adaptado a Venezuela: Pago Móvil con catálogo de bancos y validación de referencia, y Efectivo en dólares con selector de billete entregado y calculadora de vuelto exacto.
**Acceptance criteria:**
- [x] `src/client/components/PaymentModal.jsx`: Tabs para "Pago Móvil" y "Efectivo USD".
  - En Pago Móvil: muestra datos de cobro del conductor (banco, teléfono, cédula) y formulario para que el pasajero ingrese banco emisor y número de referencia.
  - En Efectivo USD: botones rápidos ($5, $10, $20, $50) y cálculo dinámico de vuelto en USD y equivalente en Bs.
- [x] El conductor recibe los datos del pago y presiona "Confirmar Pago Recibido", liberando el viaje.
- [x] Pantalla de resumen final y calificación con estrellas.
**Verification:**
- [x] El registro de Pago Móvil valida la referencia y el cálculo de vuelto en dólares funciona con precisión.
**Dependencies:** Task 7
**Files likely touched:**
- `src/client/components/PaymentModal.jsx`
- `src/client/components/DriverPaymentConfirm.jsx`
- `src/client/components/RatingModal.jsx`
- `src/client/App.jsx`
**Estimated scope:** Medium (4 files)

---

## Task 9: PWA Android, Service Worker y Pulido Visual
**Description:** Configurar el Web App Manifest (`manifest.json`), registrar el Service Worker para funcionamiento offline/rápido en Android, generar iconos de app y pulir los detalles visuales de la interfaz minimalista.
**Acceptance criteria:**
- [x] `public/manifest.json`: Nombre "RideX Venezuela", display `standalone`, orientación `portrait`, theme_color `#0B0F17`.
- [x] `public/sw.js`: Service worker con estrategia de caché para arranque instantáneo.
- [x] Iconos PWA generados y vinculados en `index.html`.
- [x] Ajuste de `viewport-fit=cover` y safe-areas para pantallas Android con notch.
**Verification:**
- [x] Lighthouse o navegador detecta manifest válido y ofrece opción "Instalar aplicación".
- [x] La app se ejecuta a pantalla completa en Android sin barra del navegador.
**Dependencies:** Task 8
**Files likely touched:**
- `public/manifest.json`
- `public/sw.js`
- `index.html`
- `src/client/index.css`
**Estimated scope:** Medium (4 files)

---

## Checkpoint: Complete Verification
- [x] Todas las pruebas unitarias y de integración pasan (`npm test`).
- [x] Flujo de extremo a extremo probado con éxito (Pasajero solicita -> Conductor acepta -> Navega -> Paga con Pago Móvil/Efectivo -> Conductor confirma -> Fin).
- [x] Build de producción compila sin errores (`npm run build`).
