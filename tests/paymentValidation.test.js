import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validatePhone,
  validateNationalId,
  validateReference,
  validatePagoMovil,
  calculateCashChange,
  VENEZUELAN_BANKS
} from '../src/client/utils/banks.js';

test('VENEZUELAN_BANKS contiene los principales bancos venezolanos', () => {
  assert.ok(VENEZUELAN_BANKS.length >= 20);
  assert.ok(VENEZUELAN_BANKS.some(b => b.code === '0102' && b.name.includes('Venezuela')));
  assert.ok(VENEZUELAN_BANKS.some(b => b.code === '0134' && b.name.includes('Banesco')));
  assert.ok(VENEZUELAN_BANKS.some(b => b.code === '0105' && b.name.includes('Mercantil')));
  assert.ok(VENEZUELAN_BANKS.some(b => b.code === '0172' && b.name.includes('Bancamiga')));
});

test('validatePhone reconoce números celulares venezolanos válidos e inválidos', () => {
  assert.equal(validatePhone('04121234567'), true);
  assert.equal(validatePhone('04149876543'), true);
  assert.equal(validatePhone('04245556677'), true);
  assert.equal(validatePhone('04161112233'), true);
  assert.equal(validatePhone('04269998877'), true);
  assert.equal(validatePhone('+58 0412 123 4567'), true);

  // Inválidos
  assert.equal(validatePhone('02125556677'), false); // Fijo
  assert.equal(validatePhone('123456'), false);
  assert.equal(validatePhone(null), false);
});

test('validateNationalId valida cédulas y RIF venezolanos', () => {
  assert.equal(validateNationalId('V-12345678'), true);
  assert.equal(validateNationalId('V12345678'), true);
  assert.equal(validateNationalId('E-82123456'), true);
  assert.equal(validateNationalId('J-312345678'), true);

  assert.equal(validateNationalId('12345678'), false); // Sin letra V/E/J
  assert.equal(validateNationalId(''), false);
});

test('validateReference valida longitud de referencia bancaria', () => {
  assert.equal(validateReference('1234'), true);
  assert.equal(validateReference('987654'), true);
  assert.equal(validateReference('00123456'), true);

  assert.equal(validateReference('12'), false); // Muy corta
  assert.equal(validateReference(''), false);
});

test('validatePagoMovil valida el payload completo', () => {
  const validData = {
    phone: '04121234567',
    bankCode: '0102',
    idDoc: 'V-18999888',
    reference: '774411'
  };
  const result = validatePagoMovil(validData);
  assert.equal(result.isValid, true);
  assert.equal(result.errors.length, 0);

  const invalidData = {
    phone: '123',
    bankCode: '9999',
    idDoc: 'invalid',
    reference: '1'
  };
  const invalidResult = validatePagoMovil(invalidData);
  assert.equal(invalidResult.isValid, false);
  assert.ok(invalidResult.errors.length >= 3);
});

test('calculateCashChange calcula vuelto en USD y bolívares', () => {
  const rate = 50.0;

  // Pago con billete mayor
  const res1 = calculateCashChange({ fareUsd: 3.5, billReceivedUsd: 10, bcvRate: rate });
  assert.equal(res1.isValid, true);
  assert.equal(res1.changeUsd, 6.5);
  assert.equal(res1.changeBs, 325.0);

  // Pago exacto
  const res2 = calculateCashChange({ fareUsd: 5.0, billReceivedUsd: 5, bcvRate: rate });
  assert.equal(res2.isValid, true);
  assert.equal(res2.changeUsd, 0);

  // Pago insuficiente
  const res3 = calculateCashChange({ fareUsd: 10.0, billReceivedUsd: 5, bcvRate: rate });
  assert.equal(res3.isValid, false);
  assert.equal(res3.missingUsd, 5.0);
});
