/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        army: {
          dark: '#050705',
          panel: '#0E140E',
          border: '#1E2D1E',
          green: '#2A4D25',
          gold: '#C5A059',
          goldLight: '#E8D2A6',
          brightGreen: '#4ADE80',
          brightRed: '#F87171',
          threatRed: '#991B1B'
        }
      },
      fontFamily: {
        mono: ['Courier New', 'Courier', 'monospace']
      }
    },
  },
  plugins: [],
}
