# Tokens

The 32 semantic custom properties every component styles against. Generated into
`src/lib/styles/_tokens.sass` by `node scripts/gen-palette.mjs <palette>` — **never hand-edit
that file.**

Ten palettes are frozen in `src/lib/styles/data/palettes.json`, so any of them can be emitted
after `shadcn-registry/` is deleted:

```bash
node scripts/gen-palette.mjs neutral            # → _tokens.sass (:root + .dark)
node scripts/gen-palette.mjs violet --class     # → styles/themes/_violet.sass (.theme-violet)
```

Available: `default neutral zinc red rose orange green blue yellow violet`.

## The background/foreground convention

Tokens come in pairs. `--primary` is a background; `--primary-foreground` is the text colour
that sits on it. The `-background` suffix is always omitted.

```sass
	background-color: var(--primary)
	color: var(--primary-foreground)
```

Any token you add must follow the same pairing.

## Radius

`--radius` is `0.625rem`. Every corner derives from it via `+radius($step)`:

| Step | Value                       |
| ---- | --------------------------- |
| `sm` | `calc(var(--radius) - 4px)` |
| `md` | `calc(var(--radius) - 2px)` |
| `lg` | `var(--radius)`             |
| `xl` | `calc(var(--radius) + 4px)` |

`2xl` (`1rem`) and `full` (`9999px`) are fixed — **not** derived. The oracle emits
`var(--radius-2xl)` for these; that is a Tailwind default we do not define, so resolve it.

## Opacity

Use `color-mix`, matching the oracle:

```sass
	background-color: color-mix(in oklab, var(--primary) 80%, transparent)
```

## The `neutral` palette

| Token                          | Light                       | Dark                         |
| ------------------------------ | --------------------------- | ---------------------------- |
| `--background`                 | `oklch(1 0 0)`              | `oklch(0.145 0 0)`           |
| `--foreground`                 | `oklch(0.145 0 0)`          | `oklch(0.985 0 0)`           |
| `--card`                       | `oklch(1 0 0)`              | `oklch(0.205 0 0)`           |
| `--card-foreground`            | `oklch(0.145 0 0)`          | `oklch(0.985 0 0)`           |
| `--popover`                    | `oklch(1 0 0)`              | `oklch(0.205 0 0)`           |
| `--popover-foreground`         | `oklch(0.145 0 0)`          | `oklch(0.985 0 0)`           |
| `--primary`                    | `oklch(0.205 0 0)`          | `oklch(0.922 0 0)`           |
| `--primary-foreground`         | `oklch(0.985 0 0)`          | `oklch(0.205 0 0)`           |
| `--secondary`                  | `oklch(0.97 0 0)`           | `oklch(0.269 0 0)`           |
| `--secondary-foreground`       | `oklch(0.205 0 0)`          | `oklch(0.985 0 0)`           |
| `--muted`                      | `oklch(0.97 0 0)`           | `oklch(0.269 0 0)`           |
| `--muted-foreground`           | `oklch(0.556 0 0)`          | `oklch(0.708 0 0)`           |
| `--accent`                     | `oklch(0.97 0 0)`           | `oklch(0.269 0 0)`           |
| `--accent-foreground`          | `oklch(0.205 0 0)`          | `oklch(0.985 0 0)`           |
| `--destructive`                | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)`  |
| `--border`                     | `oklch(0.922 0 0)`          | `oklch(1 0 0 / 10%)`         |
| `--input`                      | `oklch(0.922 0 0)`          | `oklch(1 0 0 / 15%)`         |
| `--ring`                       | `oklch(0.708 0 0)`          | `oklch(0.556 0 0)`           |
| `--chart-1`                    | `oklch(0.646 0.222 41.116)` | `oklch(0.488 0.243 264.376)` |
| `--chart-2`                    | `oklch(0.6 0.118 184.704)`  | `oklch(0.696 0.17 162.48)`   |
| `--chart-3`                    | `oklch(0.398 0.07 227.392)` | `oklch(0.769 0.188 70.08)`   |
| `--chart-4`                    | `oklch(0.828 0.189 84.429)` | `oklch(0.627 0.265 303.9)`   |
| `--chart-5`                    | `oklch(0.769 0.188 70.08)`  | `oklch(0.645 0.246 16.439)`  |
| `--radius`                     | `0.625rem`                  | `—`                          |
| `--sidebar`                    | `oklch(0.985 0 0)`          | `oklch(0.205 0 0)`           |
| `--sidebar-foreground`         | `oklch(0.145 0 0)`          | `oklch(0.985 0 0)`           |
| `--sidebar-primary`            | `oklch(0.205 0 0)`          | `oklch(0.488 0.243 264.376)` |
| `--sidebar-primary-foreground` | `oklch(0.985 0 0)`          | `oklch(0.985 0 0)`           |
| `--sidebar-accent`             | `oklch(0.97 0 0)`           | `oklch(0.269 0 0)`           |
| `--sidebar-accent-foreground`  | `oklch(0.205 0 0)`          | `oklch(0.985 0 0)`           |
| `--sidebar-border`             | `oklch(0.922 0 0)`          | `oklch(1 0 0 / 10%)`         |
| `--sidebar-ring`               | `oklch(0.708 0 0)`          | `oklch(0.556 0 0)`           |

## Type scale

Defined in `_typography.sass`, mirroring Tailwind v4 defaults the source was authored against:
`--text-xs` `--text-sm` `--text-base` `--text-lg` `--text-xl` `--text-2xl`, each with a
matching `--text-*--line-height`.

## Theming

Override on `:root`, or on any ancestor to scope a theme to a subtree:

```sass
.theme-brand
	--primary: oklch(0.55 0.2 265)
	--primary-foreground: oklch(0.99 0 0)
```

Dark mode is the `.dark` class on an ancestor. Most components need no dark rules — the tokens
already switch.
