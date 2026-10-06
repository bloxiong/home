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
          display: ['Archivo', 'Helvetica Neue', 'Arial', 'sans-serif'],
          sans:    ['Archivo', 'Helvetica Neue', 'Arial', 'sans-serif'],
          mono:    ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        },
      },
    },
    plugins: [],
  }
