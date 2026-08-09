# Release Readiness — FractalKnow

Known blockers and security decisions for shipping a release build.
Last updated: 2026-07-31 (branch `audit/replication-review`).

## Release blockers

### 1. Updater is wired but unconfigured — BLOCKER

`src-tauri/tauri.conf.json` → `plugins.updater` ships with:

```json
"updater": {
  "endpoints": [],
  "pubkey": ""
}
```

With no endpoints and no signing pubkey, `check_update_status` /
`install_update` (`src-tauri/src/updater.rs`) can never fetch or verify a
release; the updater will always resolve "idle"/error. **Before any
release:** set the update endpoint(s), generate a signing keypair
(`tauri signer generate`), put the pubkey in the config, and keep the
private key out of the repo.

### 2. Content Security Policy — RESOLVED (verify manually)

`app.security.csp` was `null` (no CSP). A policy is now set in
`tauri.conf.json`:

- `default-src 'self'`, `script-src 'self'` (no inline scripts, no eval)
- `style-src 'self' 'unsafe-inline'` (Svelte/Sass injects `<style>` tags
  at runtime; removing `'unsafe-inline'` is future hardening work)
- `img-src 'self' data: blob: asset: http://asset.localhost`,
  `font-src 'self' data:`
- `connect-src 'self' ipc: http://ipc.localhost http://localhost:1420
  ws://localhost:1420` (Tauri IPC + Vite dev HMR)
- `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`

**Action before release:** smoke-test the production build (menus,
editor, terminal, dialogs) to confirm nothing depended on the previously
absent CSP, and revisit `style-src 'unsafe-inline'` if styles are ever
fully extracted.

### 3. `simulate_panic` test command — RESOLVED

`simulate_panic` (`src-tauri/src/lib.rs`) lets any webview code trigger a
native panic plus a crash-report write. It now returns an error unless
built with `debug_assertions` (debug/test builds only), so release
binaries refuse the call.

## Reported, owner decision pending (not fixed)

### Feedback / GitHub handoff points at the upstream project

`submit_feedback` (`src-tauri/src/lib.rs`) and the browser-preview
fallback (`src/lib/desktop/bridge.ts`) send users to
`https://github.com/inkeep/open-knowledge/issues` — the original
OpenKnowledge repo, not a FractalKnow destination. The Help menu
"FractalKnow on GitHub" item uses the same upstream URL. **Owner
decision needed:** create/point at a FractalKnow repo or keep the
upstream handoff intentionally.
