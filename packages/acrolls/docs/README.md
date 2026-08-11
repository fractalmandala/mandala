# Acrolls documentation

**Use this handbook to wire Acrolls into your own SvelteKit project without help.**

Acrolls is a **SvelteKit publishing + docs framework**:

1. **Articles** — Markdown / mdsvex (`.md`, `.svx`) with publication-grade code, tables, figures  
2. **Docs shell** — Fumadocs-class sidebar, nested nav, TOC, breadcrumbs, pager  

It does **not** replace routing, auth, CMS, or hosting. You keep the app; Acrolls owns article compile + docs chrome.

---

## Start here

Coding agents can use the repository-root [`llms.txt`](../llms.txt) as a compact map, then
follow the linked pages below. Human operators should continue with this handbook.

**Recommended first path:** build the local Acrolls clone, run the CLI onboarding walkthrough
from your host root, and follow its file-by-file checkpoints. The manual pages are the detailed
reference when a host needs a deliberate customization.

| If you want… | Read |
|---|---|
| A CLI-led drop-in to an existing SvelteKit site | [CLI onboarding](./cli.md#onboard) |
| Manual integration details and snippets | [Getting started](./getting-started.md) |
| Exact SvelteKit file changes | [Integrate into SvelteKit](./integrate-sveltekit.md) |
| Writing `.md` / `.svx` content | [Content authoring](./content-authoring.md) |
| Sidebar, TOC, multi-section docs | [Docs shell](./docs-shell.md) |
| Foundation vs default CSS | [Styles](./styles.md) |
| `onboard` / `validate` / `studio` / `integrate` | [CLI reference](./cli.md) |
| Package map & exports | [Packages reference](./packages.md) |
| Build fails / weird HTML | [Troubleshooting](./troubleshooting.md) |
| Work from this monorepo (`file:`) | [Local / monorepo install](./local-install.md) |
| A clean independent-host trial | [Third-host trial](#third-host-trial) → [checklist](./checklist.md) |

Copy-paste snippets live under [`docs/snippets/`](./snippets/).

---

## Current install reality (read this)

The installable `acrolls` command is released as a thin wrapper around `@acrolls/cli`. Once the
runtime packages and CLI are published, install it in the host with `pnpm add -D acrolls`. For
the current local host trial, build and run the CLI from the Acrolls monorepo on disk:

```bash
# once, from the Acrolls clone
cd /path/to/acrolls && pnpm install && pnpm build

# then, from the existing SvelteKit host
cd /path/to/your-sveltekit-app
node /path/to/acrolls/packages/cli/dist/index.js onboard --docs-dir docs --base-href /docs
```

The registry form is:

```bash
cd /path/to/your-sveltekit-app
pnpm add -D acrolls
pnpm exec acrolls onboard --docs-dir docs --base-href /docs
```

The CLI is guidance-only: it prints the exact package commands, files, snippets, cautions, and
checks, then lets the host keep ownership of its adapter and deployment. If you need to wire the
host manually, use the package commands it prints or follow the detailed reference below:

```bash
pnpm add \
  file:/Users/amrit/acrolls/packages/mdsvex \
  file:/Users/amrit/acrolls/packages/svelte \
  file:/Users/amrit/acrolls/packages/styles \
  file:/Users/amrit/acrolls/packages/docs

pnpm add -D mdsvex
# the same CLI is available as a built local binary:
# /Users/amrit/acrolls/packages/cli/dist/index.js
```

Adjust absolute paths to your machine. Do **not** add `@acrolls/sveltekit` via `file:` yet:
it uses workspace-internal dependencies. For a local host, use the four packages above,
`@acrolls/mdsvex` for the compiler, and `@acrolls/docs/content` for generated docs.

After an Acrolls change, rebuild it, reinstall the host dependencies, and restart the dev
server: `cd /path/to/acrolls && pnpm build`, then `cd /path/to/host && pnpm install`.

When runtime packages are published, swap `file:…` for `@acrolls/…@x.y.z`; publish the
runtime packages first, then `@acrolls/cli`, then the unscoped `acrolls` wrapper.

---

## Two products in one SDK

```text
┌─────────────────────────────────────────────────────┐
│  DocsShell (sidebar · TOC · crumbs · pager)         │  ← @acrolls/docs
│  ┌───────────────────────────────────────────────┐  │
│  │  Publication (article body)                   │  │  ← @acrolls/svelte
│  │  compiled from .md / .svx                     │  │  ← @acrolls/mdsvex
│  └───────────────────────────────────────────────┘  │
│  styles: foundation | default                        │  ← @acrolls/styles
└─────────────────────────────────────────────────────┘
```

- **Blog / essays only** → mdsvex + Publication + styles (no docs shell)  
- **Product docs** → docs shell + Publication inside content  

---

## Requirements

- Node ≥ 20.19  
- SvelteKit 2 + Svelte 5  
- pnpm recommended  
- `mdsvex` as a host dependency

---

## Third-host trial

Use this exact route to validate Acrolls in a new SvelteKit site:

1. Build the Acrolls clone, then run `acrolls onboard` from the host root.
2. Follow the CLI checkpoints through the generated `/docs` route; the manual
   [Getting started](./getting-started.md) page explains each generated file in detail.
3. Add only the four supported local packages shown above.
4. Follow [checklist.md](./checklist.md), including an `index.md`, a nested catch-all route,
   lazy document renderer, shell, sidebar persistence, and a production build.
5. If a local package appears stale, use the refresh routine in
   [troubleshooting.md](./troubleshooting.md#local-file-package-is-stale).

This is a local-development installation. Do not deploy an application that depends on
`file:` packages; switch to published, versioned packages when Acrolls is released to a
registry.

---

## Status

Public alpha quality. APIs may change before 1.0. See [VISION.md](./VISION.md) for roadmap (themes, npm, acrolls site).
