import type { UserConfig } from 'vite'

export default {
  server: {
    proxy: {
        '/api': 'http://localhost:8000'
    }
  }
} satisfies UserConfig