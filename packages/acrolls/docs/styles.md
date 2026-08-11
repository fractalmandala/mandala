# Styles

## Modes

| Import | When |
|---|---|
| `@acrolls/styles/default.css` | Greenfield articles; want full editorial scale |
| `@acrolls/styles/foundation.css` | Host already owns fonts, rhythm, colors |

```ts
import '@acrolls/styles/default.css';
// or
import '@acrolls/styles/foundation.css';
```

Docs shell has its own sheet (always import if you use DocsShell):

```ts
import '@acrolls/docs/styles.css';
```

---

## Token bridge

Acrolls reads host CSS variables when present:

| Host token | Used for |
|---|---|
| `--font-body` | Body font |
| `--font-heading` | Headings |
| `--font-mono` | Code |
| `--foreground` | Text |
| `--muted-foreground` | Secondary text |
| `--border` | Rules / frames |
| `--accent` | Links / accents |
| `--card` / `--muted` | Surfaces |
| `--background` | Article background |
| `--radius` | Corners |

Override Acrolls tokens directly on `.acrolls` or `.acrolls-docs-shell`:

```css
.acrolls {
  --acrolls-content-width: 68ch;
  --acrolls-accent: #0f766e;
}

.acrolls-docs-shell {
  --acrolls-docs-sidebar-width: 18rem;
  --acrolls-docs-toc-width: 14rem;
  --acrolls-docs-accent: #0f766e;
}
```

---

## SASS (optional)

```sass
@use '@acrolls/styles/sass/tokens' as *
@include acrolls-tokens()
```

Still ship a CSS entry for mechanics (`foundation` / `default`). SASS is for hosts that author tokens in indented SASS.

---

## Dark mode

Default/foundation respond to:

- `prefers-color-scheme`  
- `data-theme="light|dark"` on `.acrolls`  

Host owns the theme toggle; Acrolls styles follow.

---

## Themes roadmap

Polished multi-theme packs are planned (see VISION). Today you theme via CSS variables + host design system.
