import { DEFAULT_BCV_RATE } from '../shared/constants.js';

class BcvService {
  constructor() {
    this.currentRate = DEFAULT_BCV_RATE;
    this.lastUpdated = new Date().toISOString();
    this.source = 'Oficial BCV';
  }

  getRate() {
    return {
      rate: this.currentRate,
      lastUpdated: this.lastUpdated,
      source: this.source
    };
  }

  setManualRate(newRate) {
    const rate = Number(newRate);
    if (isNaN(rate) || rate <= 0) {
      throw new Error('La tasa debe ser un número positivo');
    }
    this.currentRate = Math.round(rate * 100) / 100;
    this.lastUpdated = new Date().toISOString();
    this.source = 'Ajuste manual operador';
    return this.getRate();
  }

  async fetchLiveRate() {
    // Intento de consulta a APIs públicas de tasas venezolanas con fallback seguro
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.promedio) {
          this.currentRate = Math.round(Number(data.promedio) * 100) / 100;
          this.lastUpdated = new Date().toISOString();
          this.source = 'BCV Oficial (API en vivo)';
        }
      }
    } catch {
      // Si la red falla o está offline en Termux, conserva la tasa configurada sin interrumpir el servicio
      console.log('[BCV] Red externa inaccesible, usando tasa de respaldo:', this.currentRate);
    }
    return this.getRate();
  }
}

export const bcvService = new BcvService();
