// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import vue from "@astrojs/vue";

// https://astro.build/config
export default defineConfig({
  server: {
    port: 4321,
    host: true,
    allowedHosts: true // ← Permite TODOS los hosts
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: true, // ← Esto también
      cors: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    }
  },


  integrations: [vue({
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith('calendar') || tag.startsWith('ion-')
      }
    },
  })]
});