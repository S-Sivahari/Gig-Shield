import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load the root .env so the API key is available as import.meta.env.VITE_*
  const env = loadEnv(mode, path.resolve(__dirname, '../..'), '')

  return {
    plugins: [react()],
    define: {
      // Expose OPENWEATHER_API_KEY from root .env as VITE_OPENWEATHER_API_KEY
      'import.meta.env.VITE_OPENWEATHER_API_KEY': JSON.stringify(
        env.OPENWEATHER_API_KEY ?? ''
      ),
    },
  }
})
