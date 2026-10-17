# 🚗 RideX Venezuela (PanaRide) — Plataforma de Transporte Bajo Demanda

Aplicación móvil estilo Uber/Ridery completamente funcional, intuitiva, minimalista y diseñada específicamente para operar en **teléfonos Android** dentro del contexto económico y operativo de **Venezuela**.

---

## 🇻🇪 Adaptaciones Especiales para Venezuela

1. **Moneda Dual & Tasa Oficial BCV:**
   - Visualización simultánea de tarifas en **Dólares ($ USD)** y **Bolívares (Bs.)**.
   - Botón en la barra superior con la tasa BCV oficial del día, con capacidad de **actualización en vivo por API** y **ajuste manual inmediato** en caso de fluctuaciones.
2. **Métodos de Pago Tradicionales y Adaptados:**
   - **Pago Móvil:** Catálogo con más de 20 bancos venezolanos (Banco de Venezuela 0102, Banesco 0134, Mercantil 0105, Bancamiga 0172, Provincial 0108, etc.), validación de teléfono celular nacional (0412, 0414, 0424, 0416, 0426), cédula y número de referencia. Botón para copiar los datos de cobro con un toque.
   - **Efectivo USD (Divisas):** Calculadora integrada de cambio/vuelto. El pasajero indica con qué billete va a pagar ($5, $10, $20, $50) y la app calcula el vuelto exacto en dólares y bolívares para que el conductor tenga el cambio listo.
3. **Categorías de Vehículos Urbanos:**
   - **Moto Express:** Para sortear rápidamente el tráfico caraqueño y de ciudades venezolanas a menor costo.
   - **Carro Estándar:** Sedanes y hatchbacks económicos para 3-4 personas.
   - **Carro Confort:** Vehículos modernos con garantía de **Aire Acondicionado full**, ideal para zonas cálidas o viajes ejecutivos.
4. **Mapas Ligeros y Rápidos:**
   - Basados en **Leaflet y OpenStreetMap** con capa oscura minimalista. No requiere claves de pago de Google Maps y consume un mínimo de datos móviles en redes 3G/4G.
   - Selector rápido con un toque de lugares icónicos (Plaza Venezuela, Altamira, CCCT, Las Mercedes, Capitolio, etc.).
5. **Experiencia PWA Nativa para Android:**
   - Instalable directamente en la pantalla de inicio de Android (sin pasar por Play Store).
   - Modo de pantalla completa (`standalone`), alertas con tonos auditivos nativos (Web Audio API) y **vibración háptica** en el teléfono (`navigator.vibrate`).

---

## 📲 Cómo Ejecutar la Aplicación en Android (Termux)

### 1. Iniciar el Servidor de Producción
En tu terminal Termux:
```bash
cd ~/ridex-vzla
npm start
```
El servidor arrancará en:
```
http://localhost:3000
```

### 2. Abrir e Instalar en tu Teléfono
1. Abre **Google Chrome** en tu teléfono Android.
2. Ingresa a `http://localhost:3000` (o usa la IP local de tu WiFi si deseas probar desde otro teléfono conectado a la misma red: `http://192.168.x.x:3000`).
3. En Chrome, toca los tres puntos verticales **(⋮)** en la esquina superior derecha y selecciona **"Instalar aplicación"** o **"Agregar a la pantalla principal"**.
4. ¡Listo! La app aparecerá con su icono estilizado de RideX en el cajón de aplicaciones de tu Android y se abrirá a pantalla completa como una app nativa.

---

## 🔄 Cómo Probar Ambos Roles (Pasajero y Conductor)

Puedes probar todo el sistema tú mismo:
1. En la barra superior, pulsa el botón **"Pasajero"** para alternar a **"Conductor"**.
2. **Como Pasajero:**
   - Selecciona origen y destino (tocando el mapa o los botones rápidos de Caracas).
   - Escoge entre **Moto Express**, **Carro Estándar** o **Carro Confort**.
   - Observa la cotización en $ y Bs.
   - Presiona **"SOLICITAR RIDEX"**.
3. **Como Conductor:**
   - Cambia a la vista de **"Conductor"**.
   - Enciende el switch **"En Línea"**.
   - Sonará la campana de alerta y el teléfono vibrará con la nueva carrera.
   - Presiona **"Aceptar Carrera"**.
   - Avanza los pasos: *"He llegado al sitio"* ➔ *"Iniciar Recorrido"* ➔ *"Finalizar Viaje"*.
4. **Pago y Liquidación:**
   - Vuelve a la vista de Pasajero y presiona **"Pagar Viaje"**.
   - Elige **Pago Móvil** (ingresa tu banco y número de referencia) o **Efectivo USD** (selecciona tu billete).
   - El conductor verá los datos en su pantalla y presionará **"Confirmar Pago Recibido"**.

---

## 🧪 Pruebas Automatizadas

El proyecto cuenta con una suite completa de pruebas unitarias y de integración de extremo a extremo (E2E) con WebSockets:
```bash
npm test
```
*Cobertura: cálculo de tarifas y distancias, validación bancaria de Venezuela, cálculo de vuelto en dólares, y ciclo de vida del viaje en tiempo real.*
