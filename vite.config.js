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
        timeout: 120000, // 120 second timeout (2 minutes)
        proxyTimeout: 120000,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Add API key to all requests
            proxyReq.setHeader('X-Api-Key', '34317d16-2f3e-47d5-93e3-6b631dde821f')
          })
          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err)
          })
        }
      }
    }
  }
})
