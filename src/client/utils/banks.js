/**
 * Catálogo oficial de bancos autorizados para Pago Móvil en Venezuela.
 */
export const VENEZUELAN_BANKS = [
  { code: '0102', name: 'Banco de Venezuela (BDV)' },
  { code: '0105', name: 'Banco Mercantil' },
  { code: '0108', name: 'BBVA Banco Provincial' },
  { code: '0134', name: 'Banesco Banco Universal' },
  { code: '0172', name: 'Bancamiga Banco Universal' },
  { code: '0191', name: 'Banco Nacional de Crédito (BNC)' },
  { code: '0114', name: 'Bancaribe' },
  { code: '0115', name: 'Banco Exterior' },
  { code: '0163', name: 'Banco del Tesoro' },
  { code: '0175', name: 'Banco Bicentenario' },
  { code: '0177', name: 'BANFANB' },
  { code: '0104', name: 'Banco Venezolano de Crédito' },
  { code: '0128', name: 'Banco Caroní' },
  { code: '0138', name: 'Banco Plaza' },
  { code: '0151', name: 'BFC Banco Fondo Común' },
  { code: '0156', name: '100% Banco' },
  { code: '0157', name: 'Banco del Sur' },
  { code: '0166', name: 'Banco Agrícola de Venezuela' },
  { code: '0168', name: 'Bancrecer' },
  { code: '0169', name: 'Mi Banco' },
  { code: '0171', name: 'Banco Activo' },
  { code: '0174', name: 'Banplus' }
];

/**
 * Valida un número telefónico venezolano (ej: 04121234567, 0414..., 0424..., 0416..., 0426...).
 */
export function validatePhone(phone) {
  if (!phone) return false;
  let cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.startsWith('58')) {
    cleaned = cleaned.slice(2);
  }
  if (!cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '0' + cleaned;
  }
  return /^(0412|0414|0424|0416|0426)\d{7}$/.test(cleaned);
}

/**
 * Valida un documento de identidad venezolano (V-12345678, E-12345678, J-123456789).
 */
export function validateNationalId(idDoc) {
  if (!idDoc) return false;
  const trimmed = String(idDoc).trim().toUpperCase();
  return /^[VEJP]-?\d{6,9}$/.test(trimmed);
}

/**
 * Valida una referencia de Pago Móvil (debe tener entre 4 y 8 dígitos numéricos).
 */
export function validateReference(ref) {
  if (!ref) return false;
  const cleaned = String(ref).trim().replace(/\D/g, '');
  return cleaned.length >= 4 && cleaned.length <= 8;
}

/**
 * Valida el conjunto de datos de un comprobante de Pago Móvil.
 */
export function validatePagoMovil({ phone, bankCode, idDoc, reference }) {
  const errors = [];

  if (!validatePhone(phone)) {
    errors.push('El teléfono debe tener formato válido (ej: 04121234567).');
  }

  const bankExists = VENEZUELAN_BANKS.some(b => b.code === String(bankCode));
  if (!bankExists) {
    errors.push('Selecciona un banco venezolano válido.');
  }

  if (!validateNationalId(idDoc)) {
    errors.push('La cédula/RIF debe tener formato válido (ej: V-12345678).');
  }

  if (!validateReference(reference)) {
    errors.push('La referencia bancaria debe tener entre 4 y 8 dígitos.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calcula el vuelto para pagos en efectivo en dólares.
 */
export function calculateCashChange({ fareUsd, billReceivedUsd, bcvRate }) {
  const fare = Number(fareUsd);
  const received = Number(billReceivedUsd);
  const rate = Number(bcvRate);

  if (isNaN(received) || received <= 0) {
    return {
      isValid: false,
      changeUsd: 0,
      changeBs: 0,
      message: 'Ingresa un billete válido.'
    };
  }

  if (received < fare) {
    const missingUsd = Math.round((fare - received) * 100) / 100;
    const missingBs = Math.round(missingUsd * rate * 100) / 100;
    return {
      isValid: false,
      changeUsd: 0,
      changeBs: 0,
      missingUsd,
      missingBs,
      message: `Monto insuficiente. Faltan $${missingUsd.toFixed(2)} (Bs. ${missingBs.toFixed(2)}).`
    };
  }

  const changeUsd = Math.round((received - fare) * 100) / 100;
  const changeBs = Math.round(changeUsd * rate * 100) / 100;

  return {
    isValid: true,
    fareUsd: fare,
    billReceivedUsd: received,
    changeUsd,
    changeBs,
    message: changeUsd === 0 
      ? 'Pago exacto. No requiere vuelto.' 
      : `Vuelto a entregar: $${changeUsd.toFixed(2)} (o Bs. ${changeBs.toFixed(2)})`
  };
}
