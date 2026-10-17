/**
 * Catálogo Exhaustivo de Motos y Vehículos en Venezuela
 * Basado en el parque automotor venezolano real (ensambladoras nacionales,
 * marcas tradicionales y nuevos vehículos importados).
 */

export const VENEZUELAN_MOTORCYCLES = [
  // --- BERA (Líder en Venezuela) ---
  { make: 'Bera', model: 'Bera SBR 150', category: 'moto', displacement: '150cc', isPopular: true },
  { make: 'Bera', model: 'Bera León BR 200', category: 'moto', displacement: '200cc', isPopular: true },
  { make: 'Bera', model: 'Bera Kavak 150', category: 'moto', displacement: '150cc', isPopular: true },
  { make: 'Bera', model: 'Bera Socialista 150', category: 'moto', displacement: '150cc', isPopular: true },
  { make: 'Bera', model: 'Bera Mérida 150', category: 'moto', displacement: '150cc' },
  { make: 'Bera', model: 'Bera DT 200 (Enduro)', category: 'moto', displacement: '200cc' },
  { make: 'Bera', model: 'Bera Runner 150 (Scooter)', category: 'moto', displacement: '150cc' },
  { make: 'Bera', model: 'Bera Mustang 150', category: 'moto', displacement: '150cc' },
  { make: 'Bera', model: 'Bera Cobra 150', category: 'moto', displacement: '150cc' },
  { make: 'Bera', model: 'Bera GTR 150', category: 'moto', displacement: '150cc' },
  { make: 'Bera', model: 'Bera BWS 150', category: 'moto', displacement: '150cc' },

  // --- EMPIRE KEEWAY (Ensamblaje Nacional Charallave) ---
  { make: 'Empire Keeway', model: 'Empire Horse 150 (I y II)', category: 'moto', displacement: '150cc', isPopular: true },
  { make: 'Empire Keeway', model: 'Empire Arsen II 150', category: 'moto', displacement: '150cc', isPopular: true },
  { make: 'Empire Keeway', model: 'Empire TX 200 (Enduro)', category: 'moto', displacement: '200cc', isPopular: true },
  { make: 'Empire Keeway', model: 'Empire RKV 200', category: 'moto', displacement: '200cc', isPopular: true },
  { make: 'Empire Keeway', model: 'Empire Owen 150', category: 'moto', displacement: '150cc', isPopular: true },
  { make: 'Empire Keeway', model: 'Empire Speed 200', category: 'moto', displacement: '200cc' },
  { make: 'Empire Keeway', model: 'Empire Outlook 150 (Automática)', category: 'moto', displacement: '150cc' },
  { make: 'Empire Keeway', model: 'Empire EK Xpress 150', category: 'moto', displacement: '150cc' },
  { make: 'Empire Keeway', model: 'Empire Superlight 200 (Custom)', category: 'moto', displacement: '200cc' },
  { make: 'Empire Keeway', model: 'Empire Cruiser 250', category: 'moto', displacement: '250cc' },

  // --- MOTOS TORO (Gran crecimiento en Venezuela) ---
  { make: 'Motos Toro', model: 'Toro Rex 150', category: 'moto', displacement: '150cc', isPopular: true },
  { make: 'Motos Toro', model: 'Toro Tank 200', category: 'moto', displacement: '200cc', isPopular: true },
  { make: 'Motos Toro', model: 'Toro León 150', category: 'moto', displacement: '150cc', isPopular: true },
  { make: 'Motos Toro', model: 'Toro Jaguar 150', category: 'moto', displacement: '150cc' },
  { make: 'Motos Toro', model: 'Toro TR 250 (Enduro)', category: 'moto', displacement: '250cc' },
  { make: 'Motos Toro', model: 'Toro Hunter 150', category: 'moto', displacement: '150cc' },
  { make: 'Motos Toro', model: 'Toro Boxer 150', category: 'moto', displacement: '150cc' },

  // --- SUZUKI VENEZUELA ---
  { make: 'Suzuki', model: 'Suzuki GN 125 (Clásica Indestructible)', category: 'moto', displacement: '125cc', isPopular: true },
  { make: 'Suzuki', model: 'Suzuki AX 100 (2 Tiempos)', category: 'moto', displacement: '100cc', isPopular: true },
  { make: 'Suzuki', model: 'Suzuki EN 125-2A', category: 'moto', displacement: '125cc' },
  { make: 'Suzuki', model: 'Suzuki Gixxer 150', category: 'moto', displacement: '150cc' },
  { make: 'Suzuki', model: 'Suzuki DR 200 (Dual Sport)', category: 'moto', displacement: '200cc' },
  { make: 'Suzuki', model: 'Suzuki DR 650', category: 'moto', displacement: '650cc' },
  { make: 'Suzuki', model: 'Suzuki V-Strom 650', category: 'moto', displacement: '650cc' },

  // --- YAMAHA ---
  { make: 'Yamaha', model: 'Yamaha YBR 125 (ED / Express)', category: 'moto', displacement: '125cc', isPopular: true },
  { make: 'Yamaha', model: 'Yamaha DT 125 / 175', category: 'moto', displacement: '175cc', isPopular: true },
  { make: 'Yamaha', model: 'Yamaha FZ 16 / FZ-S 2.0', category: 'moto', displacement: '150cc', isPopular: true },
  { make: 'Yamaha', model: 'Yamaha BWS 125 (Automática)', category: 'moto', displacement: '125cc' },
  { make: 'Yamaha', model: 'Yamaha Crypton 115', category: 'moto', displacement: '115cc' },
  { make: 'Yamaha', model: 'Yamaha XT 250 / Ténéré 250', category: 'moto', displacement: '250cc' },
  { make: 'Yamaha', model: 'Yamaha XT 660', category: 'moto', displacement: '660cc' },

  // --- MD HAOJIN ---
  { make: 'MD Haojin', model: 'MD Águila HJ 150', category: 'moto', displacement: '150cc', isPopular: true },
  { make: 'MD Haojin', model: 'MD Trepador 200 (Enduro)', category: 'moto', displacement: '200cc' },
  { make: 'MD Haojin', model: 'MD Halcón 150', category: 'moto', displacement: '150cc' },
  { make: 'MD Haojin', model: 'MD Cóndor 150', category: 'moto', displacement: '150cc' },
  { make: 'MD Haojin', model: 'MD Lechuza 200', category: 'moto', displacement: '200cc' },

  // --- SKYGO & AVA ---
  { make: 'Skygo', model: 'Skygo Elegance SG 150', category: 'moto', displacement: '150cc' },
  { make: 'Skygo', model: 'Skygo Executive 250', category: 'moto', displacement: '250cc' },
  { make: 'Skygo', model: 'Skygo Corcel 150', category: 'moto', displacement: '150cc' },
  { make: 'AVA', model: 'AVA Jaguar 150', category: 'moto', displacement: '150cc' },
  { make: 'AVA', model: 'AVA Tiger 200 (Enduro)', category: 'moto', displacement: '200cc' },

  // --- HONDA ---
  { make: 'Honda', model: 'Honda CG 125 Titan / Fan', category: 'moto', displacement: '125cc', isPopular: true },
  { make: 'Honda', model: 'Honda XR 150L / XR 190L', category: 'moto', displacement: '150cc', isPopular: true },
  { make: 'Honda', model: 'Honda XR 250 Tornado', category: 'moto', displacement: '250cc' },
  { make: 'Honda', model: 'Honda CB 190R', category: 'moto', displacement: '190cc' },
  { make: 'Honda', model: 'Honda Storm 125', category: 'moto', displacement: '125cc' },
  { make: 'Honda', model: 'Honda Transalp 650', category: 'moto', displacement: '650cc' },

  // --- KAWASAKI & OTRAS ---
  { make: 'Kawasaki', model: 'Kawasaki KLR 650', category: 'moto', displacement: '650cc', isPopular: true },
  { make: 'Kawasaki', model: 'Kawasaki Versys 300 / 650', category: 'moto', displacement: '300cc' },
  { make: 'Escuda', model: 'Escuda 150 Sport', category: 'moto', displacement: '150cc' }
];

export const VENEZUELAN_CARS = [
  // --- CHEVROLET (Histórico número 1 en Venezuela) ---
  { make: 'Chevrolet', model: 'Chevrolet Aveo (Sedán 4 ptas)', category: 'carro_standard', isPopular: true, hasAcDefault: true },
  { make: 'Chevrolet', model: 'Chevrolet Aveo (3 ptas Hatchback)', category: 'carro_standard', isPopular: true, hasAcDefault: true },
  { make: 'Chevrolet', model: 'Chevrolet Aveo (5 ptas)', category: 'carro_standard', isPopular: true, hasAcDefault: true },
  { make: 'Chevrolet', model: 'Chevrolet Spark (Cronos / LT)', category: 'carro_standard', isPopular: true, hasAcDefault: false },
  { make: 'Chevrolet', model: 'Chevrolet Optra (Design / Advance / Limited)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Chevrolet', model: 'Chevrolet Corsa (1.4 / 1.6 / Speed)', category: 'carro_standard', isPopular: true, hasAcDefault: false },
  { make: 'Chevrolet', model: 'Chevrolet Cruze 1.8 (Ecotec)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Chevrolet', model: 'Chevrolet Astra (1.8 / 2.0 / 2.2)', category: 'carro_confort', hasAcDefault: true },
  { make: 'Chevrolet', model: 'Chevrolet Sail 1.4', category: 'carro_standard', hasAcDefault: true },
  { make: 'Chevrolet', model: 'Chevrolet Grand Vitara (4x2 / 4x4)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Chevrolet', model: 'Chevrolet Silverado (1500 / C-10)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Chevrolet', model: 'Chevrolet Tahoe (V8 5.3L)', category: 'carro_confort', hasAcDefault: true },
  { make: 'Chevrolet', model: 'Chevrolet Trailblazer', category: 'carro_confort', hasAcDefault: true },
  { make: 'Chevrolet', model: 'Chevrolet Luv D-Max (Pick-up)', category: 'carro_confort', hasAcDefault: true },

  // --- TOYOTA VENEZUELA (Símbolo de Confiabilidad) ---
  { make: 'Toyota', model: 'Toyota Corolla (Gli / Seg / XEi 1.8 - 2.0)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Toyota', model: 'Toyota Corolla (Baby Camry / Araya / Sky)', category: 'carro_standard', isPopular: true, hasAcDefault: true },
  { make: 'Toyota', model: 'Toyota Corolla (New Sensation / Pantallita)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Toyota', model: 'Toyota Yaris (Belta / Belfast Sedán)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Toyota', model: 'Toyota Yaris (Hatchback)', category: 'carro_standard', isPopular: true, hasAcDefault: true },
  { make: 'Toyota', model: 'Toyota Starlet (Glanza / 1.3)', category: 'carro_standard', isPopular: true, hasAcDefault: false },
  { make: 'Toyota', model: 'Toyota Terios (Be-Go / Cool 4WD)', category: 'carro_standard', isPopular: true, hasAcDefault: true },
  { make: 'Toyota', model: 'Toyota Hilux (Kavak 2.7 / 4.0 V6)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Toyota', model: 'Toyota Fortuner (4x2 / 4x4 V6)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Toyota', model: 'Toyota 4Runner (SR5 / Limited)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Toyota', model: 'Toyota Land Cruiser (Machito Serie 70)', category: 'carro_confort', hasAcDefault: true },
  { make: 'Toyota', model: 'Toyota Land Cruiser (Autana / Burbuja)', category: 'carro_confort', hasAcDefault: true },
  { make: 'Toyota', model: 'Toyota Land Cruiser Prado', category: 'carro_confort', hasAcDefault: true },
  { make: 'Toyota', model: 'Toyota Avanza 1.5', category: 'carro_standard', hasAcDefault: true },
  { make: 'Toyota', model: 'Toyota RAV4', category: 'carro_confort', hasAcDefault: true },

  // --- FORD MOTOR DE VENEZUELA (Planta Valencia) ---
  { make: 'Ford', model: 'Ford Fiesta (Power / Max / Move 1.6)', category: 'carro_standard', isPopular: true, hasAcDefault: true },
  { make: 'Ford', model: 'Ford Fiesta Titanium (Automático)', category: 'carro_confort', hasAcDefault: true },
  { make: 'Ford', model: 'Ford Focus (Duratec 2.0 Sedán / HB)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Ford', model: 'Ford EcoSport (1.6 / 2.0 / 4WD)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Ford', model: 'Ford Ka 1.6 (Zetec Rocam)', category: 'carro_standard', isPopular: true, hasAcDefault: false },
  { make: 'Ford', model: 'Ford Laser (1.6 / 1.8)', category: 'carro_standard', hasAcDefault: true },
  { make: 'Ford', model: 'Ford Explorer (Eddie Bauer / XLT 4x4)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Ford', model: 'Ford Fusion (V6 3.0)', category: 'carro_confort', hasAcDefault: true },
  { make: 'Ford', model: 'Ford F-150 / Fortaleza', category: 'carro_confort', hasAcDefault: true },
  { make: 'Ford', model: 'Ford Ranger (Pick-up)', category: 'carro_confort', hasAcDefault: true },

  // --- HYUNDAI ---
  { make: 'Hyundai', model: 'Hyundai Accent (1.3 / 1.5 / Maxx)', category: 'carro_standard', isPopular: true, hasAcDefault: false },
  { make: 'Hyundai', model: 'Hyundai Getz (GL 1.6 Hatchback)', category: 'carro_standard', isPopular: true, hasAcDefault: true },
  { make: 'Hyundai', model: 'Hyundai Elantra (1.6 / 2.0)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Hyundai', model: 'Hyundai Tucson (GL / GLS 4x2 y 4x4)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Hyundai', model: 'Hyundai Santa Fe (V6)', category: 'carro_confort', hasAcDefault: true },
  { make: 'Hyundai', model: 'Hyundai Grand i10', category: 'carro_standard', hasAcDefault: true },
  { make: 'Hyundai', model: 'Hyundai Creta', category: 'carro_confort', hasAcDefault: true },

  // --- KIA ---
  { make: 'Kia', model: 'Kia Rio (Stylus 1.5)', category: 'carro_standard', isPopular: true, hasAcDefault: true },
  { make: 'Kia', model: 'Kia Rio (Xcite / Rio 4)', category: 'carro_confort', hasAcDefault: true },
  { make: 'Kia', model: 'Kia Picanto (Ion / Morning 1.1 - 1.2)', category: 'carro_standard', isPopular: true, hasAcDefault: true },
  { make: 'Kia', model: 'Kia Cerato (Forte / K3)', category: 'carro_confort', hasAcDefault: true },
  { make: 'Kia', model: 'Kia Sportage (Active / Revolution)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Kia', model: 'Kia Carens', category: 'carro_confort', hasAcDefault: true },

  // --- RENAULT (Sofasa / Ensamblaje) ---
  { make: 'Renault', model: 'Renault Twingo (1.2 8v / 16v)', category: 'carro_standard', isPopular: true, hasAcDefault: false },
  { make: 'Renault', model: 'Renault Clio (1.6 16v Dynamique)', category: 'carro_standard', isPopular: true, hasAcDefault: true },
  { make: 'Renault', model: 'Renault Logan (1.6 Familiar)', category: 'carro_standard', isPopular: true, hasAcDefault: true },
  { make: 'Renault', model: 'Renault Symbol (1.6 Sedán)', category: 'carro_standard', isPopular: true, hasAcDefault: true },
  { make: 'Renault', model: 'Renault Megane (Classic / II)', category: 'carro_confort', hasAcDefault: true },
  { make: 'Renault', model: 'Renault Sandero / Stepway', category: 'carro_standard', hasAcDefault: true },
  { make: 'Renault', model: 'Renault Duster (1.6 / 2.0 4x4)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Renault', model: 'Renault Kangoo', category: 'carro_standard', hasAcDefault: false },

  // --- CHERY (Gran flota en Venezuela) ---
  { make: 'Chery', model: 'Chery Arauca (1.3 Hatchback)', category: 'carro_standard', isPopular: true, hasAcDefault: true },
  { make: 'Chery', model: 'Chery Orinoco (1.8 Sedán)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Chery', model: 'Chery Tiggo (2.0 / 2.4 SUV)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Chery', model: 'Chery Grand Tiger (Pick-up 4x2 / 4x4)', category: 'carro_confort', hasAcDefault: true },
  { make: 'Chery', model: 'Chery X1 (Crossover)', category: 'carro_standard', hasAcDefault: true },
  { make: 'Chery', model: 'Chery QQ (311)', category: 'carro_standard', hasAcDefault: false },

  // --- MITSUBISHI (Planta Barcelona, Anzoátegui) ---
  { make: 'Mitsubishi', model: 'Mitsubishi Lancer (Touring 2.0)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Mitsubishi', model: 'Mitsubishi Lancer (GLX 1.6 / CK)', category: 'carro_standard', isPopular: true, hasAcDefault: true },
  { make: 'Mitsubishi', model: 'Mitsubishi Signo (Plus / GLi 1.3)', category: 'carro_standard', isPopular: true, hasAcDefault: true },
  { make: 'Mitsubishi', model: 'Mitsubishi Montero (Dakar / Sport 4x4)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Mitsubishi', model: 'Mitsubishi Outlander', category: 'carro_confort', hasAcDefault: true },
  { make: 'Mitsubishi', model: 'Mitsubishi Galant (V6)', category: 'carro_confort', hasAcDefault: true },

  // --- NISSAN ---
  { make: 'Nissan', model: 'Nissan Sentra (B13 Clásico)', category: 'carro_standard', isPopular: true, hasAcDefault: false },
  { make: 'Nissan', model: 'Nissan Sentra (B14 / B15 / B16)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Nissan', model: 'Nissan Tiida (1.8 Sedán / HB)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Nissan', model: 'Nissan Almera', category: 'carro_standard', hasAcDefault: true },
  { make: 'Nissan', model: 'Nissan Versa', category: 'carro_confort', hasAcDefault: true },
  { make: 'Nissan', model: 'Nissan March', category: 'carro_standard', hasAcDefault: true },
  { make: 'Nissan', model: 'Nissan Patrol (Super Safari 4.8L)', category: 'carro_confort', hasAcDefault: true },
  { make: 'Nissan', model: 'Nissan X-Trail (4WD)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Nissan', model: 'Nissan Frontier / D22', category: 'carro_confort', hasAcDefault: true },

  // --- FIAT ---
  { make: 'Fiat', model: 'Fiat Palio (Fire 1.3 / 1.4 / 1.8)', category: 'carro_standard', isPopular: true, hasAcDefault: false },
  { make: 'Fiat', model: 'Fiat Siena (Fire 1.4 / HLX 1.8)', category: 'carro_standard', isPopular: true, hasAcDefault: true },
  { make: 'Fiat', model: 'Fiat Uno (Fire / Mille 1.3)', category: 'carro_standard', isPopular: true, hasAcDefault: false },
  { make: 'Fiat', model: 'Fiat Palio Adventure (Locker)', category: 'carro_confort', hasAcDefault: true },
  { make: 'Fiat', model: 'Fiat Idea / Punto', category: 'carro_standard', hasAcDefault: true },
  { make: 'Fiat', model: 'Fiat Fiorino', category: 'carro_standard', hasAcDefault: false },

  // --- JEEP ---
  { make: 'Jeep', model: 'Jeep Cherokee (XJ Clásica 4.0)', category: 'carro_standard', isPopular: true, hasAcDefault: true },
  { make: 'Jeep', model: 'Jeep Cherokee (Liberty KJ / KK 3.7 V6)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Jeep', model: 'Jeep Grand Cherokee (WJ / WK / Laredo)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Jeep', model: 'Jeep Wrangler (TJ / JK Rubicon)', category: 'carro_confort', hasAcDefault: true },
  { make: 'Jeep', model: 'Jeep Compass', category: 'carro_confort', hasAcDefault: true },

  // --- VENIRAUTO (Planta Maracay) ---
  { make: 'Venirauto', model: 'Venirauto Centauro (1.6 / 1.8)', category: 'carro_standard', isPopular: true, hasAcDefault: true },
  { make: 'Venirauto', model: 'Venirauto Turpial (1.3)', category: 'carro_standard', isPopular: true, hasAcDefault: false },

  // --- CHANGAN, JAC & DONGFENG (Nuevos favoritos en Venezuela) ---
  { make: 'Changan', model: 'Changan Alsvin 1.4 - 1.5 Sedán', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Changan', model: 'Changan CS35 Plus (SUV)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'Changan', model: 'Changan CS55 Plus (SUV Confort)', category: 'carro_confort', hasAcDefault: true },
  { make: 'JAC', model: 'JAC JS4 (SUV Confort)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'JAC', model: 'JAC S3 (Crossover)', category: 'carro_confort', isPopular: true, hasAcDefault: true },
  { make: 'JAC', model: 'JAC T6 / T8 (Pick-up Doble Cabina)', category: 'carro_confort', hasAcDefault: true },
  { make: 'Dongfeng', model: 'Dongfeng S30 (Sedán)', category: 'carro_standard', hasAcDefault: true },
  { make: 'Dongfeng', model: 'Dongfeng Rich 6 (Pick-up)', category: 'carro_confort', hasAcDefault: true }
];

export const VENEZUELAN_VEHICLE_COLORS = [
  'Blanco',
  'Negro',
  'Plata / Plateado',
  'Gris Plomo',
  'Rojo',
  'Azul Marino',
  'Azul Eléctrico',
  'Dorado / Beige',
  'Vinotinto',
  'Verde Oliva',
  'Amarillo',
  'Naranja'
];

export const VENEZUELAN_VEHICLE_YEARS = Array.from({ length: 32 }, (_, i) => String(2026 - i));

/**
 * Obtener marcas únicas según el tipo de vehículo
 * @param {'moto' | 'carro_standard' | 'carro_confort' | 'all'} vehicleType
 */
export function getBrandsForVehicleType(vehicleType) {
  if (vehicleType === 'moto') {
    return Array.from(new Set(VENEZUELAN_MOTORCYCLES.map((m) => m.make))).sort();
  }
  return Array.from(new Set(VENEZUELAN_CARS.map((c) => c.make))).sort();
}

/**
 * Obtener modelos según la marca y tipo de vehículo
 * @param {string} make
 * @param {'moto' | 'carro_standard' | 'carro_confort'} vehicleType
 */
export function getModelsForBrand(make, vehicleType) {
  if (vehicleType === 'moto') {
    return VENEZUELAN_MOTORCYCLES.filter((m) => m.make.toLowerCase() === (make || '').toLowerCase()).map((m) => m.model);
  }
  return VENEZUELAN_CARS.filter((c) => c.make.toLowerCase() === (make || '').toLowerCase()).map((c) => c.model);
}

/**
 * Buscar vehículos populares por tipo
 */
export function getPopularVehicles(vehicleType = 'moto') {
  if (vehicleType === 'moto') {
    return VENEZUELAN_MOTORCYCLES.filter((m) => m.isPopular);
  }
  return VENEZUELAN_CARS.filter((c) => c.isPopular);
}

/**
 * Autodetectar categoría recomendada (moto, carro_standard, carro_confort)
 */
export function inferVehicleCategory(modelName) {
  if (!modelName) return 'carro_standard';
  const moto = VENEZUELAN_MOTORCYCLES.find((m) => m.model.toLowerCase() === modelName.toLowerCase());
  if (moto) return 'moto';

  const car = VENEZUELAN_CARS.find((c) => c.model.toLowerCase() === modelName.toLowerCase());
  if (car) return car.category;

  return 'carro_standard';
}
