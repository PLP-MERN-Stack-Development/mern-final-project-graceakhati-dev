/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'forest-green': '#295F2D',
        'leaf-green': '#4CAF50',
        'earth-brown': '#7A5F44',
        'light-sand': '#FDF8EC',
        'soft-white': '#FCFCFB',
        'planet-green': {
          dark: '#2E7D32',
          light: '#A5D6A7',
        },
        'planet-brown': {
          dark: '#8D6E63',
          light: '#D7CCC8',
        },
      },
      fontFamily: {
        'playful': ['Rubik Bubbles', 'Bungee', 'cursive'],
        'planet': ['Rubik Bubbles', 'Bungee', 'cursive'],
      },
      keyframes: {
        'float-1': {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '33%': { transform: 'translateY(-20px) translateX(10px)' },
          '66%': { transform: 'translateY(-10px) translateX(-5px)' },
        },
        'float-2': {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '50%': { transform: 'translateY(-30px) translateX(-15px)' },
        },
        'float-3': {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '25%': { transform: 'translateY(-15px) translateX(8px)' },
          '75%': { transform: 'translateY(-25px) translateX(-8px)' },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'bounce-hover': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'scale-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'motion-subtle': {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-4px) scale(1.02)' },
        },
      },
      animation: {
        'float-1': 'float-1 6s ease-in-out infinite',
        'float-2': 'float-2 8s ease-in-out infinite',
        'float-3': 'float-3 7s ease-in-out infinite',
        'bounce-slow': 'bounce-slow 3s ease-in-out infinite',
        'bounce-hover': 'bounce-hover 0.6s ease-in-out',
        'fade-in': 'fade-in 1s ease-out',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'scale-pulse': 'scale-pulse 2s ease-in-out infinite',
        'motion-subtle': 'motion-subtle 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

