import React from 'react';
import { Compass, Clock, Wallet, User } from 'lucide-react';
import { triggerHaptic } from '../utils/soundEffects.js';

export function BottomNav({ activeTab, onSelectTab, badgeCount = 0 }) {
  const tabs = [
    { id: 'rides', label: 'Viajes', icon: Compass },
    { id: 'activity', label: 'Actividad', icon: Clock, badge: badgeCount },
    { id: 'wallet', label: 'Billetera', icon: Wallet },
    { id: 'profile', label: 'Perfil', icon: User }
  ];

  const handleTabClick = (tabId) => {
    triggerHaptic(35);
    onSelectTab(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-[#0a0e17]/90 backdrop-blur-2xl border-t border-white/10 px-3 pt-2 pb-[max(10px,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] select-none">
      <div className="flex items-center justify-around">
        {tabs.map(({ id, label, icon: IconComponent, badge }) => {
          const isActive = activeTab === id;

          return (
            <button
              key={id}
              onClick={() => handleTabClick(id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all duration-200 relative active:scale-90 ${
                isActive
                  ? 'text-pixel-greenLight font-black'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              {/* Contenedor del icono con pill activo estilo Pixel Material You */}
              <div className={`relative px-4 py-1 rounded-full transition-all ${
                isActive ? 'bg-pixel-green/15 text-pixel-greenLight shadow-sm' : ''
              }`}>
                <IconComponent className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5] scale-110' : 'stroke-[1.8]'}`} />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pixel-yellow text-black text-[9px] font-black flex items-center justify-center shadow-md">
                    {badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight transition-colors ${
                isActive ? 'text-white font-extrabold' : 'text-slate-400'
              }`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
