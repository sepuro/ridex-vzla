/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Obsidian Luxury Palette
        brand: {
          bg: '#06080D',
          card: '#0D111A',
          cardHover: '#141A26',
          surface: '#1A2232',
          surfaceLight: '#242F45',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(255, 255, 255, 0.16)',
          // Accents
          emerald: '#00E599',
          emeraldLight: '#38F8B6',
          emeraldDark: '#00B377',
          cyan: '#00D2FF',
          cyanLight: '#60E4FF',
          amber: '#FFB800',
          amberLight: '#FFD066',
          rose: '#FF3B5C',
          roseLight: '#FF7088',
          purple: '#8B5CF6'
        },
        // Legacy aliases for backward compatibility with existing components
        darkBg: '#06080D',
        cardBg: '#0D111A',
        surfaceBg: '#1A2232',
        borderCol: 'rgba(255, 255, 255, 0.08)',
        accentGreen: '#00E599',
        accentYellow: '#FFB800',
        accentBlue: '#00D2FF',
        dangerRed: '#FF3B5C',
        // Pixel/Cupertino tokens updated to match the high-end dark system
        pixel: {
          blue: '#00D2FF',
          blueLight: '#60E4FF',
          green: '#00E599',
          greenLight: '#38F8B6',
          yellow: '#FFB800',
          yellowLight: '#FFD066',
          red: '#FF3B5C',
          redLight: '#FF7088',
          surface: '#06080D',
          container: '#0D111A',
          containerHigh: '#1A2232',
          outline: 'rgba(255, 255, 255, 0.12)'
        },
        ios: {
          card: 'rgba(13, 17, 26, 0.85)',
          cardLight: 'rgba(255, 255, 255, 0.85)',
          border: 'rgba(255, 255, 255, 0.10)',
          borderLight: 'rgba(0, 0, 0, 0.08)',
          blue: '#00D2FF',
          green: '#00E599',
          orange: '#FFB800',
          red: '#FF3B5C',
          purple: '#8B5CF6',
          teal: '#00E599',
          gray: '#94A3B8',
          grayDark: '#0D111A'
        }
      },
      boxShadow: {
        'brand-glow': '0 0 25px -4px rgba(0, 229, 153, 0.35)',
        'brand-cyan-glow': '0 0 25px -4px rgba(0, 210, 255, 0.35)',
        'brand-amber-glow': '0 0 25px -4px rgba(255, 184, 0, 0.35)',
        'brand-card': '0 12px 36px -8px rgba(0, 0, 0, 0.65)',
        'pixel-glow': '0 0 25px -4px rgba(0, 210, 255, 0.35)',
        'pixel-green': '0 0 25px -4px rgba(0, 229, 153, 0.35)',
        'ios-glass': '0 12px 36px 0 rgba(0, 0, 0, 0.55)',
        'ios-float': '0 24px 48px -12px rgba(0, 0, 0, 0.7)'
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Roboto', 'Segoe UI', 'sans-serif']
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.75', transform: 'scale(1.04)' }
        },
        floatSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        }
      },
      animation: {
        shimmer: 'shimmer 2.2s infinite linear',
        pulseGlow: 'pulseGlow 2.5s ease-in-out infinite',
        floatSubtle: 'floatSubtle 3s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}
