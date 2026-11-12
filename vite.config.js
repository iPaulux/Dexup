import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Plugin custom pour servir/copier sql-wasm.wasm
function sqlWasmPlugin() {
  return {
    name: 'sql-wasm',
    configureServer(server) {
      server.middlewares.use('/sql-wasm.wasm', (_req, res) => {
        const wasmPath = path.resolve(__dirname, 'node_modules/sql.js/dist/sql-wasm.wasm');
        res.setHeader('Content-Type', 'application/wasm');
        fs.createReadStream(wasmPath).pipe(res);
      });
    },
    generateBundle() {
      const wasmPath = path.resolve(__dirname, 'node_modules/sql.js/dist/sql-wasm.wasm');
      const source = fs.readFileSync(wasmPath);
      this.emitFile({ type: 'asset', fileName: 'sql-wasm.wasm', source });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    sqlWasmPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'TiploufICON.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'PokéCollect',
        short_name: 'PokéCollect',
        description: 'Gère ta collection de cartes Pokémon',
        theme_color: '#f5f5f5',
        background_color: '#f5f5f5',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'TiploufICON.png', sizes: '1024x1024', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}'],
        runtimeCaching: [
          // ⚠️ On ne met PAS api.pokemontcg.io ici : les requêtes API sont
          // déjà mises en cache côté app (SQLite + Supabase). Laisser le SW
          // intercepter les appels API provoque des erreurs CORS en production
          // car le SW fait un fetch() depuis son propre scope.

          {
            // Images pokemontcg.io — StaleWhileRevalidate (plus robuste que
            // CacheFirst) : ne rejette jamais même si l'image n'existe pas.
            // statuses: [0, 200] : accepte les réponses opaques cross-origin.
            urlPattern: /^https:\/\/images\.pokemontcg\.io\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'pokemon-images',
              expiration: { maxEntries: 2000, maxAgeSeconds: 604800 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Previews Reddit (actualités TCG)
            urlPattern: /^https:\/\/(?:preview|external-preview|i)\.redd\.it\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'reddit-images',
              expiration: { maxEntries: 200, maxAgeSeconds: 86400 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    // On inclut sql.js pour que Vite le pré-bundle (CJS→ESM) et expose proprement initSqlJs
    include: ['sql.js'],
  },
  build: {
    target: 'esnext',
  },
});
