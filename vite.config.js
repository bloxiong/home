import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
  ],
  // http://agrosense360.localhost:5173 previews the AgroSense360 subdomain
  server: { allowedHosts: ['.localhost'] },
})
