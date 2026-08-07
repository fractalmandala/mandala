---
id: kernel
title: Kernel Area
type: area
tags: [kernel, state, settings]
relates_to: [ADR-004, ADR-009, ADR-015, ADR-017, ADR-026]
summary: Covers state/ide.svelte.ts and settings/browser facades.
updated: 2026-07-15
---

# Kernel Area

## Purpose & boundaries

The Kernel area governs global app state, workspace directories, active templates, configurations, and core setting values.

## State & persistence

- **Global IDE State**: Core fields in `state/ide.svelte.ts`.
- **Global Settings**: Core settings model in `state/settings.svelte.ts`.
- **Persistence**: Encrypted native keychain storage for credentials and LocalStorage keys for preferences.

## Extension points

- **Registry contributions**: Mapped settings controls inside `SettingsDialog.svelte`.

## Cross-area edges

- **State Hub**: Coordinates updates across all modular states (designer, notes, ai, etc.).

## Gotchas

- **Browser Mock Parity**: Browser compatibility mock facades must be kept updated to prevent breaks during `pnpm dev` outside Tauri.

## File table

<!-- filetable:begin -->
| File | Description |
|---|---|
| [`aiProviders.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/data/aiProviders.ts) | aiProviders.ts |
| [`errors.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/errors.ts) | Extracts a display-safe message from a caught value of unknown type — used across catch |
| [`ide.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts) | ide.svelte.ts |
| [`settings.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/state/settings.svelte.ts) | Compatibility domain store for settings and provider configuration. |
| [`totp.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/totp.ts) | Pure TypeScript TOTP / 2FA Keypass generation utility (Rule 3 & 4 compliant Svelte 5) |
| [`setup.ts`](file:////Users/amrit/fractals/apps/fractalengine/tests/unit/setup.ts) | Provide browser globals for vitest tests that import Svelte modules |

<!-- filetable:end -->
