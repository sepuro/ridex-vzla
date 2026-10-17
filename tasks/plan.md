# Implementation Plan: RideX Venezuela (PanaRide)

## Overview
Construcción de una plataforma de transporte bajo demanda estilo Uber/Ridery para Android, optimizada como Progressive Web App (PWA) de alto rendimiento, minimalista y completamente adaptada a la realidad económica y operativa de Venezuela (pagos en Pago Móvil y Efectivo USD con cálculo de vuelto, tasa BCV en tiempo real, motos y carros, mapas Leaflet/OSM livianos y sincronización en tiempo real vía WebSockets).

## Architecture Decisions
- **Frontend SPA + PWA:** React 19 + Tailwind CSS + Lucide Icons + Leaflet para interfaz ultra-rápida, touch-friendly para Android (targets >= 48px, gestos, bottom sheets) e instalable como WebAPK en la pantalla de inicio.
- **Backend Node.js + WebSocket (`ws`):** Servidor unificado en el puerto 3000 que sirve la API REST, la sincronización bidireccional en tiempo real entre pasajeros y conductores, y los archivos estáticos de la PWA.
- **Mapas y Ruteo Ligero:** OpenStreetMap con Leaflet y motor de cálculo de distancias (Haversine) integrado, garantizando funcionamiento fluido en redes móviles 3G/4G sin dependencia de APIs comerciales de Google.
- **Sistema Monetario y Financiero Venezolano:**
  - Conversión dual en tiempo real: Dólares ($ USD) y Bolívares (Bs.) al cambio oficial del BCV.
  - Formato estandarizado de Pago Móvil con catálogo de bancos nacionales (BDV, Banesco, Mercantil, Bancamiga, Provincial, etc.), cédula, teléfono y número de referencia.
  - Módulo de Efectivo USD con calculadora de vuelto para evitar conflictos por escasez de billetes de baja denominación.
- **Audio y Vibración Web Nativos:** Uso de Web Audio API para generar tonos de alerta sin dependencias de audio externas y `navigator.vibrate` para feedback háptico en Android.

---

## Task List

### Phase 1: Foundation & Shared Domain
- [ ] Task 1: Configurar proyecto, dependencias (React, Vite, Tailwind, Leaflet, Express, WS) y estructura de archivos
- [ ] Task 2: Implementar módulo de tarifas, conversión BCV y catálogo de bancos venezolanos con pruebas unitarias

### Checkpoint: Foundation
- [ ] Todas las pruebas unitarias de tarifas y validación bancaria pasan (`npm test`)
- [ ] Dependencias instaladas y servidor base respondiendo correctamente

### Phase 2: Backend & Realtime State Engine
- [ ] Task 3: Crear servidor Express y motor de estados de viaje con WebSocket (`rideManager.js`)
- [ ] Task 4: Implementar servicio de tasa BCV y endpoints de gestión de viajes

### Checkpoint: Realtime Engine
- [ ] Servidor WebSocket emite y recibe eventos de solicitud, aceptación y actualización de viaje
- [ ] Pruebas de integración del ciclo de vida del viaje pasando

### Phase 3: Mobile UI & Map Experience
- [ ] Task 5: Implementar Layout móvil para Android, Header con selector de rol/tasa BCV y mapa interactivo Leaflet
- [ ] Task 6: Implementar flujo del Pasajero: selección de vehículo (Moto/Carro), cálculo de tarifa dual y solicitud

### Checkpoint: Passenger Journey
- [ ] El pasajero puede seleccionar origen/destino, ver la ruta y cotización en USD y Bs. al cambio BCV

### Phase 4: Driver Dashboard, Payments & PWA
- [ ] Task 7: Implementar panel del Conductor: radar en línea, alertas sonoras/hápticas y aceptación de carreras
- [ ] Task 8: Implementar módulo de pagos de Venezuela (Pago Móvil y Efectivo USD con vuelto) y confirmación de cobro
- [ ] Task 9: Configurar PWA (Manifest, Service Worker, iconos) y pulido visual minimalista

### Checkpoint: Complete Verification
- [ ] Flujo completo verificado: Pasajero solicita -> Conductor recibe y acepta -> Recorrido -> Pago Móvil / Efectivo -> Confirmación
- [ ] PWA instalable en Android con manifest válido y respuesta háptica operativa
- [ ] Suite completa de tests pasando

---

## Risks and Mitigations
| Riesgo | Impacto | Estrategia de Mitigación |
|--------|---------|--------------------------|
| Inestabilidad de conexión móvil en Venezuela (3G/red intermitente) | Medio | Sincronización optimizada con reconexión automática de WebSocket y bajo payload de datos |
| Falta de señal GPS o permisos denegados en el móvil | Bajo | Selector táctil directo sobre el mapa y selector rápido de puntos de referencia urbanos |
| Fluctuación rápida de la tasa cambiaria | Bajo | Servicio con tasa BCV automática más selector manual directo con 1 toque en la barra superior |
| Problemas con vuelto en efectivo USD | Medio | Calculadora integrada en el checkout que especifica el billete entregado y el vuelto a devolver |

---

## Open Questions Resolved
- **Alerta sonora para conductores:** Incluida mediante sintetizador Web Audio API nativo con switch de silencio.
- **Tasa BCV:** Tasa oficial inicial configurable con actualización y ajuste manual inmediato en pantalla.
