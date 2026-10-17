import { DEFAULT_BCV_RATE } from '../shared/constants.js';

class BcvService {
  constructor() {
    this.currentRate = DEFAULT_BCV_RATE;
    this.previousRate = DEFAULT_BCV_RATE;
    this.lastUpdated = new Date().toISOString();
    this.officialDate = new Date().toISOString().split('T')[0];
    this.source = 'BCV Oficial (Banco Central de Venezuela)';
    this.isLive = false;
    this.changePercent = 0.0;
    this.refreshIntervalId = null;
    this.onRateChanged = null;

    // Iniciar sondeo periódico cada 15 minutos para capturar la actualización diaria del BCV
    this.startAutoRefresh(15 * 60 * 1000);
  }

  getRate() {
    return {
      rate: this.currentRate,
      previousRate: this.previousRate,
      changePercent: this.changePercent,
      lastUpdated: this.lastUpdated,
      officialDate: this.officialDate,
      source: this.source,
      isLive: this.isLive
    };
  }

  setManualRate(newRate) {
    const rate = Number(newRate);
    if (isNaN(rate) || rate <= 0) {
      throw new Error('La tasa debe ser un número positivo');
    }
    this.previousRate = this.currentRate;
    this.currentRate = Math.round(rate * 100) / 100;
    this.changePercent = this.previousRate > 0
      ? Math.round(((this.currentRate - this.previousRate) / this.previousRate) * 10000) / 100
      : 0;
    this.lastUpdated = new Date().toISOString();
    this.source = 'Ajuste manual operador';
    this.isLive = false;
    return this.getRate();
  }

  async fetchLiveRate() {
    let success = false;

    // Intento 1: API oficial sincronizada con BCV (ve.dolarapi.com)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.promedio && Number(data.promedio) > 0) {
          const newRate = Math.round(Number(data.promedio) * 100) / 100;
          this.previousRate = this.currentRate;
          this.currentRate = newRate;
          this.changePercent = this.previousRate > 0 && this.previousRate !== this.currentRate
            ? Math.round(((this.currentRate - this.previousRate) / this.previousRate) * 10000) / 100
            : 0;
          this.lastUpdated = new Date().toISOString();
          if (data.fechaActualizacion) {
            this.officialDate = data.fechaActualizacion;
          }
          this.source = 'BCV Oficial (Banco Central de Venezuela)';
          this.isLive = true;
          success = true;
          console.log(`[BCV] Tasa oficial sincronizada exitosamente: ${this.currentRate} Bs/$ (Fecha BCV: ${this.officialDate})`);
          if (typeof this.onRateChanged === 'function') {
            this.onRateChanged(this.getRate());
          }
        }
      }
    } catch (err) {
      console.warn('[BCV] Intento 1 falló:', err.message);
    }

    if (!success) {
      console.log('[BCV] Manteniendo tasa actual de respaldo:', this.currentRate);
    }

    return this.getRate();
  }

  startAutoRefresh(intervalMs = 900000) {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
    }
    this.refreshIntervalId = setInterval(async () => {
      try {
        await this.fetchLiveRate();
      } catch (e) {
        console.error('[BCV] Error en refresco automático:', e.message);
      }
    }, intervalMs);
    if (this.refreshIntervalId?.unref) {
      this.refreshIntervalId.unref();
    }
  }

  stopAutoRefresh() {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
  }
}

export const bcvService = new BcvService();

