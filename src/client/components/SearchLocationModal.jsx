import React, { useState, useEffect } from 'react';
import { Search, X, MapPin, Building, Landmark, Compass, Bus, Plane } from 'lucide-react';
import { searchPlaces } from '../utils/geocodingApi.js';
import { triggerHaptic } from '../utils/soundEffects.js';

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
    <div className="fixed inset-0 z-50 flex items-start justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md h-full sm:h-auto sm:max-h-[85vh] rounded-none sm:rounded-[28px] bg-[#0D111A] border-0 sm:border border-white/15 flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Cabecera del Buscador */}
        <div className="p-4 border-b border-white/[0.08] space-y-3 bg-[#06080D]/80">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-white text-base">{title}</h3>
            <button
              onClick={() => {
                triggerHaptic(30);
                onClose();
              }}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/[0.05]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Campo de búsqueda con autocompletado */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#00E599]" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar plaza, centro comercial, avenida..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-black/60 border border-white/15 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-[#00E599] focus:ring-1 focus:ring-[#00E599]"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-3 p-0.5 text-slate-400 hover:text-white"
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
                onClick={() => {
                  triggerHaptic(20);
                  setSelectedCategory(id);
                }}
                className={`flex-shrink-0 flex items-center space-x-1 px-3 py-1 rounded-full text-[11px] font-bold transition border active:scale-95 ${
                  selectedCategory === id
                    ? 'bg-[#00E599]/20 border-[#00E599] text-[#00E599]'
                    : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
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
              <span className="inline-block w-5 h-5 border-2 border-[#00E599] border-t-transparent rounded-full animate-spin mb-2" />
              <p>Consultando mapa de Venezuela...</p>
            </div>
          )}

          {!loading && filteredResults.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400">
              <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="font-bold text-slate-300">No encontramos coincidencias</p>
              <p className="text-[11px] mt-0.5">Prueba con otra palabra o toca el mapa directamente.</p>
            </div>
          )}

          {!loading && filteredResults.map((place, idx) => (
            <button
              key={`${place.name}-${idx}`}
              onClick={() => {
                triggerHaptic(40);
                onSelectLocation({
                  name: place.name,
                  lat: place.lat,
                  lng: place.lng,
                  address: place.address
                });
                onClose();
              }}
              className="w-full text-left p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-[#00E599]/40 transition flex items-center space-x-3 active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center flex-shrink-0 text-[#FFB800]">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-white text-xs truncate">{place.name}</h4>
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
