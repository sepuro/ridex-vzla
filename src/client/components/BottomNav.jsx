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
    triggerHaptic(30);
    onSelectTab(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-[#06080D]/90 backdrop-blur-2xl border-t border-white/[0.08] px-3 pt-2 pb-[max(10px,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(0,0,0,0.65)] select-none">
      <div className="flex items-center justify-around">
        {tabs.map(({ id, label, icon: IconComponent, badge }) => {
          const isActive = activeTab === id;

          return (
            <button
              key={id}
              onClick={() => handleTabClick(id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all duration-200 relative active:scale-90 ${
                isActive
                  ? 'text-[#00E599] font-black'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              {/* Contenedor del icono con pill activo y sutil resplandor */}
              <div
                className={`relative px-4 py-1.5 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-[#00E599]/15 text-[#00E599] shadow-[0_0_15px_rgba(0,229,153,0.2)] border border-[#00E599]/30'
                    : 'hover:bg-white/[0.04]'
                }`}
              >
                <IconComponent
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'stroke-[2.5] scale-110' : 'stroke-[1.8]'
                  }`}
                />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FFB800] text-black text-[9px] font-black flex items-center justify-center shadow-lg animate-bounce">
                    {badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight transition-colors ${
                  isActive ? 'text-white font-black' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
