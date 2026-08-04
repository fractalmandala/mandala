---
title: Installation
description: catalogue of blume setup and installation
---

```
**Created:**

- `sites/fractalhome/blume.config.ts` — title "FractalHome"
- `sites/fractalhome/docs/index.mdx` — home page (callout + CardGroup)
- `sites/fractalhome/package.json` — scripts: `dev`, `build`, `preview`, `check`, `validate`, `doctor`
- `.gitignore` (covers `node_modules/`, `.blume/`, `dist/`) + `pnpm-lock.yaml` updated to blume `^1.3.1`

**Verified:** `pnpm --filter fractalhome build` → static output in `dist/` (with search index, `llms.txt`, robots), `check` → 0 type errors, `validate` → no broken links.

Note: the system Node is v22.12.0 but pnpm v11 needs ≥22.13, so I ran install/build via `fnm exec --using 22.13.0 -- pnpm …`. Run `fnm use 22.13.0` (or set as default) if you want plain `pnpm` commands to work in this repo.
```

```
amrit@Amritanshus-MacBook-Pro fractalhome % blume dev

zsh: command not found: blume

amrit@Amritanshus-MacBook-Pro fractalhome %
```

"`blume` isn't on your PATH — it's a project dependency. Use the pnpm script instead:"

```
amrit@Amritanshus-MacBook-Pro fractalhome % pnpm dev

ERROR: This version of pnpm requires at least Node.js v22.13

The current version of Node.js is v22.12.0

Visit https://r.pnpm.io/comp to see the list of past pnpm versions with respective Node.js version support.

amrit@Amritanshus-MacBook-Pro fractalhome %
```

"Switch Node to 22.13 (already installed via fnm):"

```
**Why `/sveltekit` was missing:** `docs/sveltekit/index.md` had `draft: true` — Blume skips drafts in builds. Removed it, so the hub route now builds (`/sveltekit/index.html` exists in dist).

**Why the build broke (new `llmwiki/` content):** it uses four extra frontmatter keys — `created`, `updated`, `project`, `boss` — plus 2 files with unquoted colons in `description`. Fixed:

- `blume.config.ts:16-19` — allowed `created`/`updated` (`z.coerce.string()`), `project`, `boss`
- Quoted descriptions in `boss-orchestration-runtime.md` and `2026-08-02-090000-shradhapp-studio-media-workspace.md`

**Verified in `.blume-verify/src/generated/data.json`** after rebuild:

- `Home` → `/`
- Group `Llmwiki` → `/llmwiki` + concepts/entities/sources/synthesis (~130 pages, all routing)
- Group `Sveltekit` → `/sveltekit` hub + 26 children (27 total)
- Only remaining warning is cosmetic (`BLUME_DUPLICATE_SIDEBAR_ORDER` on the dated source files — falls back to alphabetical).
```