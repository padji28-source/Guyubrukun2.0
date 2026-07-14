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
        includeAssets: ["guyubrukun.png", "favicon.ico", "apple-touch-icon.png"],
        devOptions: {
          enabled: true,
          type: "module",
        },
        manifest: {
          name: "Guyub Rukun RT 01",
          short_name: "Guyub Rukun",
          description: "Aplikasi Guyub Rukun untuk warga RT 01",
          theme_color: "#0d9488",
          background_color: "#ffffff",
          display: "standalone",
          orientation: "portrait",
          start_url: "/",
          scope: "/",
          icons: [
            {
              src: "/icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any"
            },
            {
              src: "/icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "maskable"
            },
            {
              src: "/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any"
            },
            {
              src: "/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable"
            }
          ],
        },
      }),
    ],
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
    build: {
      target: "esnext",
      minify: "esbuild",
      cssMinify: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react") || id.includes("scheduler")) {
                return "vendor-react";
              }
              if (id.includes("recharts") || id.includes("d3")) {
                return "vendor-charts";
              }
              if (id.includes("lucide-react")) {
                return "vendor-icons";
              }
              if (id.includes("motion")) {
                return "vendor-motion";
              }
              if (id.includes("jspdf") || id.includes("jspdf-autotable")) {
                return "vendor-pdf";
              }
              if (id.includes("html5-qrcode")) {
                return "vendor-qrcode";
              }
              if (id.includes("@dnd-kit") || id.includes("sortable")) {
                return "vendor-dnd";
              }
              return "vendor-core";
            }
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: false,
    },
  };
});
