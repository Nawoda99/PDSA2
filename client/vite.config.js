import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const port = parseInt(env.VITE_PORT) || 3005;
  const isProd = mode === "production";

  return {
    plugins: [react()],
    base: "/",
    server: {
      host: true,
      port,
      strictPort: true,
    },
    build: {
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
        mangle: true,
      },
    },
  };
});
