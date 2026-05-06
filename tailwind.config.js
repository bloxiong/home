/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          display: ['Equinox', 'Syncopate', 'Orbitron', 'Inter', 'system-ui', 'sans-serif'],
          sans:    ['Equinox', 'Syncopate', 'Inter', 'system-ui', 'sans-serif'],
          mono:    ['Orbitron', 'ui-monospace', 'monospace'],
        },
        colors: {
          gold: {
            light: '#c99655',
            DEFAULT: '#bd8a4c',
            dark: '#a8743c',
          },
        },
      },
    },
    plugins: [],
  }
