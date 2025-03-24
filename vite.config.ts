import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

// Create a consistent CSP string for both server and preview
const createCspHeader = () => {
  return `
    default-src 'self'; 
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://*.gstatic.com; 
    script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://*.gstatic.com; 
    connect-src 'self' https://accounts.google.com https://sheets.googleapis.com https://www.googleapis.com https://raw.githubusercontent.com https://*.github.io https://*.githubusercontent.com; 
    frame-src https://accounts.google.com https://content-sheets.googleapis.com https://*.google.com; 
    form-action 'self' https://accounts.google.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
    img-src 'self' data: https://*.googleusercontent.com https://*.gstatic.com https://*.github.io https://*.githubusercontent.com; 
    font-src 'self' https://fonts.gstatic.com;
  `.replace(/\s+/g, " ");
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on mode
  const env = loadEnv(mode, process.cwd(), "");

  return {
    // Specify root directory which contains index.html
    root: path.resolve(__dirname, "./app"),

    // Ensure public path is set correctly
    base: "/",

    define: {
      "process.env.VITE_APP_VERSION": JSON.stringify(
        env.VITE_APP_VERSION || "1.6.0a"
      ),
    },
    plugins: [
      react({
        // Enable experimental features for React 19
        babel: {
          plugins: [
            ["@babel/plugin-proposal-decorators", { legacy: true }],
            ["@babel/plugin-proposal-class-properties", { loose: true }],
          ],
        },
      }),
      tailwindcss(),
      // For build time only - copies needed files
      viteStaticCopy({
        targets: [
          {
            src: "./app/configs/*",
            dest: "./configs/",
          },
          {
            src: "./app/data/*",
            dest: "./data/",
          },
          // Copy other static assets if needed
          {
            src: "./public/assets/**/*",
            dest: "./assets/",
          },
          {
            src: "./public/images/**/*",
            dest: "./images/",
          },
          {
            src: "./public/favicon.ico",
            dest: "./",
          },
          {
            src: "./public/icon.svg",
            dest: "./",
          },
          {
            src: "./public/logo.png",
            dest: "./",
          },
          {
            src: "./public/pin.png",
            dest: "./",
          },
        ],
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./app"),
        "@ui": path.resolve(__dirname, "./app/components/ui/index.ts"),
        "@types": path.resolve(__dirname, "./app/types/index.ts"),
        "@utils": path.resolve(__dirname, "./app/utils.ts"),
      },
    },
    compilerOptions: {
      baseUrl: ".",
      paths: {
        "@/*": ["./app/*"],
      },
    },
    build: {
      // Change build output directory to account for the root directory
      outDir: "../dist",
      emptyOutDir: true,
      sourcemap: true,
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: mode === "production",
          drop_debugger: mode === "production",
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
            mobx: ["mobx", "mobx-react", "mobx-react-lite"],
            leaflet: ["leaflet", "react-leaflet", "@react-leaflet/core"],
            ui: [
              "@radix-ui/react-checkbox",
              "@radix-ui/react-dialog",
              "@radix-ui/react-slider",
              "@radix-ui/react-slot",
              "@radix-ui/react-switch",
            ],
          },
          // Ensure assets are correctly hashed for caching
          assetFileNames: "assets/[name].[hash].[ext]",
        },
      },
    },
    server: {
      port: 3000,
      open: true,
      cors: true,
      // Show environment mode in console
      hmr: {
        overlay: true,
      },
      // Ensure static files are properly served during development
      watch: {
        usePolling: true,
      },
      // Add headers for development server
      headers: {
        "Content-Security-Policy": createCspHeader(),
      },
    },
    preview: {
      port: 4173,
      // Also add headers for preview server
      headers: {
        "Content-Security-Policy": createCspHeader(),
      },
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "mobx",
        "leaflet",
        "gapi-script",
        "google-auth-library",
      ],
      exclude: ["react-leaflet-markercluster"],
    },
    // Disable the public directory since we're using the app directory as root
    publicDir: false,
    // Optimize CSS rendering
    css: {
      devSourcemap: true,
      preprocessorOptions: {
        scss: {
          quietDeps: true,
        },
      },
    },
  };
});
