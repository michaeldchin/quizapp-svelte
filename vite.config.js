import { defineConfig, loadEnv } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const CERTPATH = env.VITE_CERTPATH
  const CERTKEYPATH = env.VITE_CERTKEYPATH
  return {
    server: {
      https: {
        cert: fs.readFileSync(CERTPATH),
        key: fs.readFileSync(CERTKEYPATH),
      },
    },
    plugins: [svelte()],
  }
})
