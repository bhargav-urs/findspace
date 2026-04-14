/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        apple: {
          blue:   '#0071e3',
          blueDark:'#0077ed',
          gray:   '#f5f5f7',
          dark:   '#1d1d1f',
          mid:    '#6e6e73',
          border: '#d2d2d7',
          card:   '#ffffff',
          green:  '#30d158',
          red:    '#ff3b30',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display',
          'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif',
        ],
      },
      borderRadius: {
        xl2: '1rem',
        xl3: '1.5rem',
        xl4: '2rem',
      },
      boxShadow: {
        card:   '0 2px 20px rgba(0,0,0,0.07)',
        cardHover: '0 8px 40px rgba(0,0,0,0.13)',
        nav:    '0 1px 0 rgba(0,0,0,0.08)',
        modal:  '0 25px 60px rgba(0,0,0,0.15)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse2: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      animation: {
        fadeUp:  'fadeUp 0.6s ease-out forwards',
        fadeIn:  'fadeIn 0.4s ease-out forwards',
        shimmer: 'shimmer 1.5s infinite linear',
        pulse2:  'pulse2 1.8s ease-in-out infinite',
      },
      backgroundImage: {
        shimmer: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      },
      transitionTimingFunction: {
        apple: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [],
};
