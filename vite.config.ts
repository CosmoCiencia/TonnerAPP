import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  if (mode === 'production') {
    const required = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_TONNER_PAINT_API_URL',
    ]
    const missing = required.filter((name) => !env[name]?.trim())

    if (missing.length > 0) {
      throw new Error(
        `Build de producción incompleto. Faltan variables: ${missing.join(', ')}`,
      )
    }
  }

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5192,
      strictPort: false,
    },
  }
})
