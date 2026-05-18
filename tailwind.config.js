/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        tonner: {
          bg: '#082b68',
          panel: '#0d3f9b',
          surface: '#f7f9ff',
          surfaceDark: '#081933',
          surfaceMuted: '#edf3ff',
          orange: '#ff7d00',
          orangeSoft: '#ffb85f',
          blue: '#1d56c2',
          blueSoft: '#7ca7ff',
          text: '#e8efff',
          textOnBlue: '#ffffff',
          slate: '#0f172a',
          muted: '#8ea6d9',
          mutedText: '#6d82b3',
        },
      },
      borderRadius: {
        tonner: '1.75rem',
        'tonner-sm': '1.25rem',
      },
      boxShadow: {
        tonner: '0 24px 50px rgba(5, 18, 48, 0.32)',
        glow: '0 0 0 1px rgba(255,255,255,0.08), 0 16px 36px rgba(0,0,0,0.24)',
      },
      fontFamily: {
        display: ['Sora', 'Manrope', 'sans-serif'],
        sans: ['Manrope', 'Segoe UI', 'sans-serif'],
      },
      backgroundImage: {
        'tonner-gradient':
          'linear-gradient(150deg, #082b68 0%, #1244a3 44%, #1d56c2 72%, #ff7d00 140%)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(0,-10px,0) scale(1.03)' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        rise: 'rise 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
