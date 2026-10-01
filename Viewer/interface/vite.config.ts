import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  define: { "process.env.NODE_ENV": '"production"' },
  build: {
    outDir: "../assets/build/interface", emptyOutDir: true,
    lib: { entry: "src/index.tsx", name: "ReplayInterface", formats: ["iife"], fileName: () => "interface.js", cssFileName: "interface" }
  }
});
