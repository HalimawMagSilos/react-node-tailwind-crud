// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc' // Ito ang gusto mo!

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})