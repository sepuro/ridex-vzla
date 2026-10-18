import React, { useEffect, useState } from 'react';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { playStartupChime } from '../utils/soundEffects.js';

export function SplashScreen({ onFinish }) {
  const [stage, setStage] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    playStartupChime();

    // Etapas progresivas rápidas para alto rendimiento percibido (1.2s total)
    const timer1 = setTimeout(() => setStage(1), 260);
    const timer2 = setTimeout(() => setStage(2), 540);
    const timer3 = setTimeout(() => setStage(3), 820);

    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1080);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 1300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(onFinish, 180);
  };

  const statusTexts = [
    'Iniciando núcleo de movilidad...',
    'Sincronizando tasa oficial BCV en vivo...',
    'Conectando red satelital GPS Venezuela...',
    'Sistema listo • Bienvenido a RideX'
  ];

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#06080D] px-6 py-12 select-none cursor-pointer transition-opacity transition-transform duration-250 will-change-transform ${
        isFadingOut ? 'opacity-0 scale-[0.98] pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{ transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
    >
      {/* Fondo con mallas de gradiente radial */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00E599]/15 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-[#00D2FF]/10 rounded-full blur-[90px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Botón superior para omitir */}
      <div className="w-full flex items-center justify-end z-10">
        <button
          type="button"
          onClick={handleSkip}
          className="text-[11px] font-bold text-slate-400 hover:text-white uppercase tracking-wider bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1 rounded-full border border-white/[0.06] backdrop-blur-md tap-scale"
        >
          Toque para omitir
        </button>
      </div>

      {/* Núcleo central de la marca */}
      <div className="relative flex flex-col items-center z-10 space-y-6 -mt-8">
        <div className="relative flex items-center justify-center">
          {/* Anillos orbitales con rotación fluida por hardware */}
          <div className="absolute w-36 h-36 rounded-full border border-[#00E599]/30 border-dashed animate-spin [animation-duration:12s]" />
          <div className="absolute w-44 h-44 rounded-full border border-[#00D2FF]/20 animate-spin [animation-duration:18s] [animation-direction:reverse]" />
          
          {/* Resplandor central */}
          <div className="absolute w-28 h-28 bg-[#00E599]/25 rounded-3xl blur-xl" />

          {/* Tarjeta del Icono Vectorial */}
          <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-[#141C2E] via-[#0A0E17] to-[#05070B] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.8)] border border-white/[0.15]">
            <img
              src="/icons/icon.svg"
              alt="RideX Venezuela"
              className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,229,153,0.3)]"
            />
          </div>
        </div>

        {/* Tipografía de la marca */}
        <div className="text-center space-y-1.5">
          <div className="flex items-center justify-center space-x-1">
            <h1 className="text-4xl font-black tracking-[-0.03em] text-white font-sans">
              Ride<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E599] via-[#00F5A0] to-[#00D2FF]">X</span>
            </h1>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#00E599]/20 text-[#00E599] border border-[#00E599]/40 tracking-wider">
              VZLA
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Movilidad & Envíos
          </p>
        </div>
      </div>

      {/* Indicadores inferiores de carga e inicialización */}
      <div className="w-full max-w-xs flex flex-col items-center space-y-3 z-10">
        {/* Barra de progreso fluida con aceleración cúbica */}
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden p-0.5 backdrop-blur-sm border border-white/[0.08]">
          <div
            className="h-full bg-gradient-to-r from-[#00E599] via-[#00F5A0] to-[#00D2FF] rounded-full shadow-[0_0_12px_rgba(0,229,153,0.8)] transition-[width] duration-300 ease-out-emil"
            style={{
              width: stage === 0 ? '25%' : stage === 1 ? '55%' : stage === 2 ? '85%' : '100%',
            }}
          />
        </div>

        {/* Estado en vivo con crossfade suave */}
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-400 h-5">
          <Zap className="w-3.5 h-3.5 text-[#00E599] animate-pulse flex-shrink-0" />
          <span key={stage} className="truncate animate-fade-in">{statusTexts[stage]}</span>
        </div>

        {/* Credenciales de confianza */}
        <div className="flex items-center space-x-3 text-[10px] text-slate-400 pt-2 border-t border-white/[0.06] w-full justify-center">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-[#00E599]" />
            <span>Monitoreo 24/7</span>
          </span>
          <span>•</span>
          <span>Tasa Oficial BCV</span>
          <span>•</span>
          <span>Red Nacional</span>
        </div>
      </div>
    </div>
  );
}
