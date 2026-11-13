import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

function normalizeOrigin(value = '') {
  const cleaned = value.trim().replace(/\/+$/, '')
  if (!cleaned) return ''
  return new URL(cleaned.includes('://') ? cleaned : `https://${cleaned}`).origin
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = normalizeOrigin(
    env.VITE_SITE_URL || process.env.VITE_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || '',
  )

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_SITE_URL': JSON.stringify(siteUrl),
    },
  }
})
