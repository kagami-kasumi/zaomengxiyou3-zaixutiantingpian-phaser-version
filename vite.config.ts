import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 5173,
    watch: {
      // Vite does not use .gitignore. Keep the extracted SWF corpus and
      // temporary verification outputs out of its recursive file watcher.
      // Keep runtime evidence directories (the .gitignore allowlist) watched.
      ignored: [
        '**/local-resources/**',
        '**/.tmp/**',
        /[/\\]docs[/\\]tasks[/\\]evidence[/\\](?!TASK-SETTINGS-(?:217|218|219|220)(?:[/\\]|$))/,
      ],
    },
  },
  preview: {
    // Codex's in-app browser reaches the host through an isolated browser
    // runtime, so loopback-only listeners are not reachable from visual QA.
    host: '0.0.0.0',
    port: 4174,
    strictPort: true,
  },
});
