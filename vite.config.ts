import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  preview: {
    // Codex's in-app browser reaches the host through an isolated browser
    // runtime, so loopback-only listeners are not reachable from visual QA.
    host: '0.0.0.0',
    port: 4174,
    strictPort: true,
  },
});
