import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // This forces Vite to listen on all interfaces, allowing access from your host machine/browser
    port: 5173      // (Optional) You can explicitly set the port if needed, 5173 is the default
  }
})