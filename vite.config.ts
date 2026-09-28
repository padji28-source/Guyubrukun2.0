import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: "auto",
        devOptions: {
          enabled: false,
          type: "module",
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts",
              },
            },
            {
              urlPattern: /^https:\/\/.*firebaseio\.com\/.*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "firebase-api",
              },
            },
          ],
        },
        manifest: {
          id: "/",
          orientation: "portrait",
          name: "Guyub Rukun RT 01",
          short_name: "Guyub Rukun",
          start_url: "/",
          scope: "/",
          display: "standalone",
          background_color: "#16b3a0",
          theme_color: "#0d9488",
          description: "Aplikasi Guyub Rukun untuk warga RT 01",
          icons: [
            {
              src: "/icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable"
            },
            {
              src: "/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable"
            }
          ],
        },
      }),
    ],
    define: {
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      target: "esnext",
      minify: "esbuild",
      cssMinify: true,
      sourcemap: false,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR === "true" ? false : {
        protocol: "wss",
        clientPort: 443,
      },
    },
  };
});
