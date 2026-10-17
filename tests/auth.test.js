import test from 'node:test';
import assert from 'node:assert';
import { db } from '../src/server/db/database.js';
import { DEFAULT_AVATARS } from '../src/shared/constants.js';

test('Database: Usuarios semilla iniciales existen y son válidos', () => {
  const drivers = db.getAllDrivers();
  assert.ok(drivers.length >= 1, 'Debe haber al menos 1 conductor semilla');
  const carlos = drivers.find(d => d.phone === '0412-9876543');
  assert.ok(carlos, 'Carlos Mendoza debe existir');
  assert.strictEqual(carlos.role, 'driver');
  assert.strictEqual(carlos.vehicle?.model, 'Bera SBR 150');
});

test('Database: Registro de nuevo usuario pasajero', () => {
  const phone = '0424' + Math.floor(1000000 + Math.random() * 9000000);
  const email = `test_${Date.now()}@ridex.ve`;
  const result = db.createUser({
    name: 'Andrea Valentina',
    email,
    phone,
    nationalId: 'V-27888999',
    role: 'passenger',
    city: 'Caracas',
    password: 'securePassword123'
  });

  assert.ok(result.token, 'Debe retornar un token de sesión');
  assert.strictEqual(result.user.name, 'Andrea Valentina');
  assert.strictEqual(result.user.role, 'passenger');
  assert.ok(!result.user.passwordHash, 'No debe filtrar el hash de la contraseña');
  assert.ok(!result.user.salt, 'No debe filtrar el salt');
});

test('Database: Autenticación exitosa y rechazo de contraseña incorrecta', () => {
  const phone = '0416' + Math.floor(1000000 + Math.random() * 9000000);
  db.createUser({
    name: 'Conductor Test',
    phone,
    nationalId: 'V-20111222',
    role: 'driver',
    password: 'passwordSegura456',
    vehicle: {
      vehicleType: 'carro_standard',
      make: 'Toyota',
      model: 'Yaris',
      plate: 'AB123CD',
      color: 'Gris'
    }
  });

  // Autenticación correcta
  const authOk = db.authenticateUser(phone, 'passwordSegura456');
  assert.ok(authOk.token);
  assert.strictEqual(authOk.user.name, 'Conductor Test');

  // Contraseña incorrecta
  assert.throws(() => {
    db.authenticateUser(phone, 'wrongPassword');
  }, /Contraseña incorrecta/);
});

test('Database: Actualización de foto de perfil (avatar)', () => {
  const phone = '0414' + Math.floor(1000000 + Math.random() * 9000000);
  const { user } = db.createUser({
    name: 'Usuario Avatar',
    phone,
    role: 'passenger',
    password: 'pass'
  });

  const customAvatar = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const updated = db.updateAvatar(user.id, customAvatar);
  assert.strictEqual(updated.avatar, customAvatar);

  const fetched = db.getUserById(user.id);
  assert.strictEqual(fetched.avatar, customAvatar);
});
