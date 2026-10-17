import React, { useState, useEffect } from 'react';
import { Search, X, MapPin, Building, Landmark, Compass, Bus, Plane } from 'lucide-react';
import { searchPlaces } from '../utils/geocodingApi.js';

export function SearchLocationModal({
  isOpen,
  onClose,
  title = 'Buscar Ubicación',
  onSelectLocation
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('todos');

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await searchPlaces(query);
      setResults(res);
      setLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  const categories = [
    { id: 'todos', label: 'Todos', icon: Compass },
    { id: 'mall', label: 'Malls / Sambil', icon: Building },
    { id: 'plaza', label: 'Plazas', icon: Landmark },
    { id: 'terminal', label: 'Terminales', icon: Bus },
    { id: 'aeropuerto', label: 'Aeropuerto', icon: Plane }
  ];

  const filteredResults = selectedCategory === 'todos'
    ? results
    : results.filter(r => r.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md h-full sm:h-auto sm:max-h-[85vh] rounded-none sm:rounded-3xl bg-cardBg border border-borderCol flex flex-col shadow-2xl overflow-hidden">
        {/* Cabecera del Buscador */}
        <div className="p-4 border-b border-borderCol space-y-3 bg-surfaceBg/60">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-white text-base">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-surfaceBg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Campo de búsqueda con autocompletado */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-accentGreen" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar plaza, centro comercial, avenida..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-darkBg border border-borderCol text-sm font-medium text-white placeholder-slate-400 focus:outline-none focus:border-accentGreen focus:ring-1 focus:ring-accentGreen"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtros de Categorías rápidas */}
          <div className="flex space-x-1.5 overflow-x-auto no-scrollbar pt-1">
            {categories.map(({ id, label, icon: IconComponent }) => (
              <button
                key={id}
                onClick={() => setSelectedCategory(id)}
                className={`flex-shrink-0 flex items-center space-x-1 px-3 py-1 rounded-full text-[11px] font-semibold transition border ${
                  selectedCategory === id
                    ? 'bg-accentGreen/15 border-accentGreen text-accentGreen'
                    : 'bg-darkBg/60 border-borderCol/70 text-slate-400 hover:text-white'
                }`}
              >
                <IconComponent className="w-3 h-3" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Resultados */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-1.5">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-400">
              <span className="inline-block w-5 h-5 border-2 border-accentGreen border-t-transparent rounded-full animate-spin mb-2" />
              <p>Consultando mapa de Venezuela...</p>
            </div>
          )}

          {!loading && filteredResults.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400">
              <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="font-semibold text-slate-300">No encontramos coincidencias</p>
              <p className="text-[11px] mt-0.5">Prueba con otra palabra o toca el mapa directamente.</p>
            </div>
          )}

          {!loading && filteredResults.map((place, idx) => (
            <button
              key={`${place.name}-${idx}`}
              onClick={() => {
                onSelectLocation({
                  name: place.name,
                  lat: place.lat,
                  lng: place.lng,
                  address: place.address
                });
                onClose();
              }}
              className="w-full text-left p-3 rounded-2xl bg-surfaceBg/40 hover:bg-surfaceBg/90 border border-borderCol/50 hover:border-accentGreen/50 transition flex items-center space-x-3 active:scale-98"
            >
              <div className="w-10 h-10 rounded-xl bg-darkBg border border-borderCol flex items-center justify-center flex-shrink-0 text-accentYellow">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs truncate">{place.name}</h4>
                  <span className="text-[10px] font-semibold text-slate-400 ml-2 flex-shrink-0">{place.city}</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{place.address}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
