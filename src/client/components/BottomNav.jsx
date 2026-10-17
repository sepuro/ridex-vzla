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
    triggerHaptic(40);
    onSelectTab(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-cardBg/95 backdrop-blur-xl border-t border-borderCol/80 px-2 py-2 shadow-2xl safe-area-pb">
      <div className="flex items-center justify-around">
        {tabs.map(({ id, label, icon: IconComponent, badge }) => {
          const isActive = activeTab === id;

          return (
            <button
              key={id}
              onClick={() => handleTabClick(id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all relative ${
                isActive
                  ? 'text-accentGreen font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                <IconComponent className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-accentYellow text-black text-[9px] font-black flex items-center justify-center shadow-sm">
                    {badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'text-white font-extrabold' : 'text-slate-400'}`}>
                {label}
              </span>

              {/* Indicador de pestaña activa */}
              {isActive && (
                <span className="absolute -bottom-1 w-5 h-1 rounded-full bg-accentGreen shadow-sm shadow-accentGreen" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
