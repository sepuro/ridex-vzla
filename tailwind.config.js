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
        dangerRed: '#EF4444'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
}
