/**
 * Formateo de moneda y medidas para Venezuela.
 */

export function formatUsd(amount) {
  const num = Number(amount) || 0;
  return `$${num.toFixed(2)}`;
}

export function formatBs(amount) {
  const num = Number(amount) || 0;
  // Formato estándar venezolano con coma para decimales y punto para miles
  return `Bs. ${num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDistance(km) {
  const num = Number(km) || 0;
  if (num < 1) {
    return `${Math.round(num * 1000)} m`;
  }
  return `${num.toFixed(1)} km`;
}

export function formatDuration(minutes) {
  const mins = Math.max(1, Math.round(Number(minutes) || 0));
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours} h ${remMins} min`;
  }
  return `${mins} min`;
}
