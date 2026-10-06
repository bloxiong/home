import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  // Live builds serve code, styles and images from bloxio.tech for both
  // bloxio.tech and agrosense360.bloxio.tech, so moving between them reuses
  // the browser's cache (vercel.json allows the cross-subdomain loads).
  base: process.env.VERCEL_ENV === 'production' ? 'https://bloxio.tech/' : '/',
  plugins: [react(),
    tailwindcss(),
  ],
  // http://agrosense360.localhost:5173 previews the AgroSense360 subdomain
  server: { allowedHosts: ['.localhost'] },
})
