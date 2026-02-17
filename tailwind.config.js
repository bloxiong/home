/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
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
  