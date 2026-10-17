/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#090D14',
        cardBg: '#131A26',
        surfaceBg: '#1C2638',
        borderCol: '#27354D',
        accentGreen: '#10B981',
        accentYellow: '#F59E0B',
        accentBlue: '#3B82F6',
        dangerRed: '#EF4444',
        // Google Pixel Material You Palette
        pixel: {
          blue: '#1A73E8',
          blueLight: '#8AB4F8',
          green: '#34A853',
          greenLight: '#81C995',
          yellow: '#FBBC04',
          yellowLight: '#FDD663',
          red: '#EA4335',
          redLight: '#F28B82',
          surface: '#111318',
          container: '#1D2026',
          containerHigh: '#272B33',
          outline: '#424750'
        },
        // iPhone Cupertino Frosted Glass Palette
        ios: {
          card: 'rgba(28, 28, 30, 0.78)',
          cardLight: 'rgba(255, 255, 255, 0.82)',
          border: 'rgba(255, 255, 255, 0.12)',
          borderLight: 'rgba(0, 0, 0, 0.08)',
          blue: '#007AFF',
          green: '#34C759',
          orange: '#FF9500',
          red: '#FF3B30',
          purple: '#AF52DE',
          teal: '#5AC8FA',
          gray: '#8E8E93',
          grayDark: '#1C1C1E'
        }
      },
      boxShadow: {
        'pixel-glow': '0 0 20px -5px rgba(138, 180, 248, 0.35)',
        'pixel-green': '0 0 20px -5px rgba(129, 201, 149, 0.35)',
        'ios-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'ios-float': '0 20px 40px -15px rgba(0, 0, 0, 0.5)'
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Roboto', 'Segoe UI', 'sans-serif']
      }
    },
  },
  plugins: [],
}
