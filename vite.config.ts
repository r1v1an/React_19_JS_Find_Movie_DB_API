import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'pages' ? '/React_19_JS_Find_Movie_DB_API/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
  },
}))
