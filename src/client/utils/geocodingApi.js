/**
 * Catálogo enriquecido de puntos de interés y landmarks clave en ciudades de Venezuela.
 */
export const VENEZUELA_PLACES = [
  // Caracas
  { name: 'Plaza Venezuela', address: 'Gran Avenida, Los Caobos, Caracas', city: 'Caracas', lat: 10.4965, lng: -66.8835, category: 'plaza' },
  { name: 'Plaza Altamira (Plaza Francia)', address: 'Av. Francisco de Miranda, Altamira, Chacao', city: 'Caracas', lat: 10.4969, lng: -66.8523, category: 'plaza' },
  { name: 'Centro Ciudad Comercial Tamanaco (CCCT)', address: 'Calle La Estancia, Chuao, Caracas', city: 'Caracas', lat: 10.4852, lng: -66.8596, category: 'mall' },
  { name: 'Centro Sambil Chacao', address: 'Av. Libertador, Chacao, Caracas', city: 'Caracas', lat: 10.4912, lng: -66.8554, category: 'mall' },
  { name: 'Las Mercedes (Zona Rosa / Gastronómica)', address: 'Av. Principal de Las Mercedes, Baruta', city: 'Caracas', lat: 10.4789, lng: -66.8654, category: 'comercial' },
  { name: 'Capitolio / Asamblea Nacional', address: 'Av. Universidad con Bolsa a San Francisco, Centro', city: 'Caracas', lat: 10.5050, lng: -66.9150, category: 'historico' },
  { name: 'Sabana Grande (Bulevar)', address: 'Bulevar de Sabana Grande, Caracas', city: 'Caracas', lat: 10.4935, lng: -66.8778, category: 'comercial' },
  { name: 'La Candelaria (Plaza Candelaria)', address: 'Esquina Alcabala a Pele el Ojo, La Candelaria', city: 'Caracas', lat: 10.5068, lng: -66.9034, category: 'plaza' },
  { name: 'Terminal de La Bandera (Rutas Occidente)', address: 'Av. Nueva Granada con Av. El Valle, Caracas', city: 'Caracas', lat: 10.4795, lng: -66.9095, category: 'terminal' },
  { name: 'Terminal de Oriente (Antonio José de Sucre)', address: 'Autopista Petare-Guarenas km 1', city: 'Caracas', lat: 10.4890, lng: -66.7820, category: 'terminal' },
  { name: 'Aeropuerto Internacional Simón Bolívar (Maiquetía)', address: 'Av. Aeropuerto, Maiquetía, La Guaira', city: 'La Guaira / CCS', lat: 10.6012, lng: -66.9912, category: 'aeropuerto' },
  { name: 'Parque Generalísimo Francisco de Miranda (Parque del Este)', address: 'Av. Francisco de Miranda, Los Palos Grandes', city: 'Caracas', lat: 10.4947, lng: -66.8430, category: 'parque' },
  { name: 'Ciudad Universitaria UCV (Plaza del Rectorado)', address: 'Paseo Los Ilustres, Los Chaguaramos', city: 'Caracas', lat: 10.4908, lng: -66.8890, category: 'universidad' },
  { name: 'Hospital Clínico Universitario UCV', address: 'Ciudad Universitaria, Los Chaguaramos', city: 'Caracas', lat: 10.4870, lng: -66.8850, category: 'salud' },
  { name: 'Clínica Metropolitana', address: 'Calle A-1, Caurimare, Caracas', city: 'Caracas', lat: 10.4740, lng: -66.8290, category: 'salud' },
  { name: 'Centro Comercial El Tolón Fashion Mall', address: 'Av. Principal de Las Mercedes, Caracas', city: 'Caracas', lat: 10.4800, lng: -66.8620, category: 'mall' },
  { name: 'El Hatillo (Pueblo Tradicional)', address: 'Calle Bolívar, El Hatillo, Miranda', city: 'Caracas', lat: 10.4250, lng: -66.8240, category: 'turismo' },

  // Valencia
  { name: 'Centro Sambil Valencia', address: 'Urb. Mañongo, Naguanagua, Valencia', city: 'Valencia', lat: 10.2520, lng: -68.0070, category: 'mall' },
  { name: 'Big Low Center (Terminal Terrestre)', address: 'Av. Don Julio Centeno, San Diego, Valencia', city: 'Valencia', lat: 10.1980, lng: -67.9540, category: 'terminal' },

  // Maracaibo
  { name: 'Basílica de Nuestra Señora de Chiquinquirá', address: 'Calle 95, Casco Central, Maracaibo', city: 'Maracaibo', lat: 10.6430, lng: -71.6140, category: 'historico' },
  { name: 'Centro Sambil Maracaibo', address: 'Av. Guajira, Maracaibo, Zulia', city: 'Maracaibo', lat: 10.6970, lng: -71.6360, category: 'mall' }
];

/**
 * Busca direcciones y lugares combinando el diccionario local con la API pública de OpenStreetMap Nominatim.
 */
export async function searchPlaces(query) {
  if (!query || query.trim().length < 2) {
    return VENEZUELA_PLACES.slice(0, 6);
  }

  const qClean = query.trim().toLowerCase();

  // 1. Filtrar en el diccionario local instantáneo
  const localMatches = VENEZUELA_PLACES.filter((p) =>
    p.name.toLowerCase().includes(qClean) ||
    p.address.toLowerCase().includes(qClean) ||
    p.city.toLowerCase().includes(qClean)
  );

  // 2. Si hay suficientes coincidencias locales, devolverlas de inmediato
  if (localMatches.length >= 4) {
    return localMatches.slice(0, 8);
  }

  // 3. Consultar la API pública de Nominatim para geocodificación en vivo en Venezuela
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Venezuela')}&countrycodes=ve&limit=6&addressdetails=1`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'es'
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const onlineResults = data.map((item) => {
        const parts = item.display_name.split(',');
        const shortName = parts[0] || item.name;
        const address = parts.slice(1, 4).join(',').trim();
        return {
          name: shortName,
          address: address || item.display_name,
          city: item.address?.city || item.address?.state || 'Venezuela',
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          category: 'search'
        };
      });

      // Combinar únicos
      const combined = [...localMatches, ...onlineResults];
      return combined.slice(0, 8);
    }
  } catch (err) {
    console.warn('[Geocoding API] Búsqueda externa no disponible, usando resultados locales:', err.message);
  }

  return localMatches;
}

/**
 * Geocodificación inversa: Coordenadas a nombre legible
 */
export async function reverseGeocode(lat, lng) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=17&addressdetails=1`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept-Language': 'es' }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        const parts = data.display_name.split(',');
        return parts.slice(0, 3).join(',').trim();
      }
    }
  } catch (err) {
    console.warn('[Reverse Geocode]:', err.message);
  }

  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}
