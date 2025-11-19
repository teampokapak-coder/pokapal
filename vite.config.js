import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api/pokemontcg': {
        target: 'https://api.pokemontcg.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pokemontcg/, '/v2'),
        timeout: 180000, // 180 second timeout (3 minutes) - API can be very slow
        proxyTimeout: 180000,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Add API key to all requests (use env var if available, fallback to default)
            const apiKey = process.env.VITE_POKEMON_TCG_API_KEY || '34317d16-2f3e-47d5-93e3-6b631dde821f'
            proxyReq.setHeader('X-Api-Key', apiKey)
          })
          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err)
          })
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Log slow responses
            if (proxyRes.statusCode === 504) {
              console.warn('⚠️ Pokemon TCG API timeout - the API may be slow or overloaded')
            }
          })
        }
      }
    }
  }
})
