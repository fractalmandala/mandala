# Blume Scaffolding & Architecture Guide

Blume is an Astro-powered, markdown-first documentation and knowledge base generator built for high-performance static sites with auto-generated navigation, search, and customizable Astro layout components.

---

## 1. Directory Structure of a Blume Site

```text
sites/<site-name>/
├── package.json                 # Blume dependency and CLI scripts
├── blume.config.ts             # Blume site config, Zod schemas, navigation
├── theme.css                   # CSS design tokens (--blume-*) & visual overrides
├── components.ts               # Registered Astro component overrides
├── components/                 # Custom Astro components (Logo, PageHeader, etc.)
├── docs/                       # Markdown source files (.md / .mdx)
├── public/                     # Static assets (fonts, icons, images)
├── wiki-links.mjs              # Optional remark integration for [[WikiLinks]]
└── .gitignore                  # Ignores .blume, .blume-verify, dist, node_modules
```

---

## 2. Configuration & Extensions (`blume.config.ts`)

Blume is configured via `defineConfig()` from `"blume"`. You can extend frontmatter metadata validation with Zod (`z`):

```typescript
import { defineConfig } from "blume";
import { z } from "zod";

export default defineConfig({
  title: "My Blume Wiki",
  description: "Knowledge base and documentation powered by Blume.",
  frontmatter: {
    extend: {
      tags: z.array(z.string()).optional(),
      group: z.string().optional(),
      supergroup: z.string().optional(),
      updated: z.coerce.string().optional(),
      created: z.coerce.string().optional(),
    },
  },
  navigation: {
    featured: [{ label: "Tags", href: "/tags" }],
    tabs: [
      { label: "Home", path: "/" },
      { label: "Tags", path: "/tags" },
    ],
    sidebar: {
      display: "group", // "flat" | "group" | "page"
    },
  },
  theme: {
    fonts: {
      display: "system-ui",
      body: "system-ui",
      mono: "monospace",
    },
  },
});
```

---

## 3. Visual System & CSS Tokens (`theme.css`)

Blume uses CSS custom properties for theming. Customizations should be added to `theme.css` without modifying internal `.blume` generated code.

```css
:root {
  --blume-background: oklch(1 0 0);
  --blume-foreground: oklch(0.145 0 0);
  --blume-muted: oklch(0.965 0 0);
  --blume-muted-foreground: oklch(0.54 0 0);
  --blume-border: oklch(0.88 0.006 260 / 0.72);
  --blume-accent: oklch(0.145 0 0);
  --blume-accent-foreground: oklch(1 0 0);
  --blume-radius: 0.75rem;
  --blume-content-width: 44rem;
}

:root[data-theme="dark"] {
  --blume-background: oklch(0.085 0 0);
  --blume-foreground: oklch(0.96 0 0);
  --blume-muted: oklch(0.16 0 0);
  --blume-muted-foreground: oklch(0.68 0 0);
  --blume-border: oklch(0.24 0 0 / 0.8);
  --blume-accent: oklch(0.96 0 0);
  --blume-accent-foreground: oklch(0.085 0 0);
}
```

---

## 4. Component Overrides (`components.ts`)

Blume allows replacing default layout components (Header, Sidebar, Logo, PageHeader) cleanly:

```typescript
import { defineComponents } from "blume";
import Logo from "./components/Logo.astro";
import PageHeader from "./components/PageHeader.astro";

export default defineComponents({
  layout: {
    Logo,
    PageHeader,
  },
});
```

---

## 5. CLI Commands

| Command | Purpose |
| :--- | :--- |
| `npx blume dev` | Start development server |
| `npx blume build` | Build static production output to `dist/` |
| `npx blume preview` | Preview production build output locally |
| `npx blume check` | Run content and schema typechecks |
| `npx blume validate` | Validate frontmatter against Zod schemas |
| `npx blume doctor` | Diagnostic health check |

---

## 6. Recent Blume Engine Updates & Integrations

### Optional Peer Dependencies (`@astrojs/svelte` / `@astrojs/vue`)
- `@astrojs/svelte` and `@astrojs/vue` are declared as **optional peer dependencies**.
- Projects using Svelte or Vue components as interactive islands must explicitly install the matching integration (`@astrojs/svelte` / `@astrojs/vue`) in their project dependencies.

### Strictly Typed Island Props (`TS2322` Resolution)
- Generated island wrappers infer a `Props` type alias directly from the island component's signature.
- Props spreading (`{...Astro.props}`) checks against required props, ensuring `npx blume check` (or `blume check --isolated`) passes with zero TypeScript errors.

### Typed Custom OG Routes (`TS7034`/`TS7005` Resolution)
- `customRoutes` is typed as `{ slug: string; title: string }[]`. Empty custom route arrays no longer throw implicit `any[]` errors.

### Build-Time Hydration Diagnostic
- Blume outputs a diagnostic warning at build time if a component override or framework island (React, Svelte, Vue) is included without an explicit client hydration directive (e.g., `client:load`, `client:idle`, `client:visible`), preventing interactive components from silently rendering as dead static HTML.

