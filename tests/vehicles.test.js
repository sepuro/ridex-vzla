import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VENEZUELAN_MOTORCYCLES,
  VENEZUELAN_CARS,
  getBrandsForVehicleType,
  getModelsForBrand,
  inferVehicleCategory,
  VENEZUELAN_VEHICLE_COLORS,
  VENEZUELAN_VEHICLE_YEARS
} from '../src/shared/vehiclesCatalog.js';

test('Vehículos: Catálogo contiene los principales modelos de motos en Venezuela', () => {
  assert.ok(VENEZUELAN_MOTORCYCLES.length >= 30, 'Debe incluir al menos 30 modelos de motos');
  
  const models = VENEZUELAN_MOTORCYCLES.map(m => m.model);
  assert.ok(models.some(m => m.includes('Bera SBR 150')), 'Debe incluir Bera SBR 150');
  assert.ok(models.some(m => m.includes('Empire Horse 150')), 'Debe incluir Empire Horse 150');
  assert.ok(models.some(m => m.includes('Toro Rex 150')), 'Debe incluir Toro Rex 150');
  assert.ok(models.some(m => m.includes('Suzuki GN 125')), 'Debe incluir Suzuki GN 125');
  assert.ok(models.some(m => m.includes('Yamaha YBR 125')), 'Debe incluir Yamaha YBR 125');
  assert.ok(models.some(m => m.includes('MD Águila HJ 150')), 'Debe incluir MD Águila');
});

test('Vehículos: Catálogo contiene los principales modelos de carros y camionetas en Venezuela', () => {
  assert.ok(VENEZUELAN_CARS.length >= 40, 'Debe incluir al menos 40 modelos de carros');
  
  const models = VENEZUELAN_CARS.map(c => c.model);
  assert.ok(models.some(m => m.includes('Chevrolet Aveo')), 'Debe incluir Chevrolet Aveo');
  assert.ok(models.some(m => m.includes('Chevrolet Spark')), 'Debe incluir Chevrolet Spark');
  assert.ok(models.some(m => m.includes('Toyota Corolla')), 'Debe incluir Toyota Corolla');
  assert.ok(models.some(m => m.includes('Toyota Yaris')), 'Debe incluir Toyota Yaris');
  assert.ok(models.some(m => m.includes('Ford Fiesta')), 'Debe incluir Ford Fiesta');
  assert.ok(models.some(m => m.includes('Chery Arauca')), 'Debe incluir Chery Arauca');
  assert.ok(models.some(m => m.includes('Changan Alsvin')), 'Debe incluir Changan Alsvin');
  assert.ok(models.some(m => m.includes('JAC JS4')), 'Debe incluir JAC JS4');
});

test('Vehículos: Filtro de marcas y modelos por tipo funciona dinámicamente', () => {
  const motoBrands = getBrandsForVehicleType('moto');
  assert.ok(motoBrands.includes('Bera'), 'Bera debe estar en marcas de motos');
  assert.ok(motoBrands.includes('Empire Keeway'), 'Empire Keeway debe estar en marcas de motos');
  assert.ok(motoBrands.includes('Motos Toro'), 'Motos Toro debe estar en marcas de motos');

  const beraModels = getModelsForBrand('Bera', 'moto');
  assert.ok(beraModels.includes('Bera SBR 150'), 'Bera SBR 150 debe ser modelo de Bera');

  const carBrands = getBrandsForVehicleType('carro_standard');
  assert.ok(carBrands.includes('Chevrolet'), 'Chevrolet debe estar en marcas de carros');
  assert.ok(carBrands.includes('Toyota'), 'Toyota debe estar en marcas de carros');

  const chevroletModels = getModelsForBrand('Chevrolet', 'carro_standard');
  assert.ok(chevroletModels.some(m => m.includes('Aveo')), 'Aveo debe ser modelo de Chevrolet');
});

test('Vehículos: Detección automática de categoría por modelo', () => {
  assert.equal(inferVehicleCategory('Bera SBR 150'), 'moto');
  assert.equal(inferVehicleCategory('Empire Horse 150 (I y II)'), 'moto');
  assert.equal(inferVehicleCategory('Chevrolet Aveo (Sedán 4 ptas)'), 'carro_standard');
  assert.equal(inferVehicleCategory('Toyota Corolla (Gli / Seg / XEi 1.8 - 2.0)'), 'carro_confort');
});
