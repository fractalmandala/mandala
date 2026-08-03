# Tailwind → SASS token mapping

Base: `--spacing: 0.25rem` (4px). Fractals-styler JIT utilities (`gapN`, `padN`, `marginN`, `widthN`, `heightN`, N in px) and `var(--pxN)` are available globally.

## Spacing / sizing

| Tailwind                     | SASS                                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| `p-4`                        | `padding: calc(var(--spacing) * 4)`                                                |
| `px-2` / `py-1`              | `padding-left/right` or `padding-top/bottom` with same calc                        |
| `mt-8`, `gap-2`, `space-x-4` | `margin-top: calc(var(--spacing) * 8)`, `gap: calc(var(--spacing) * 2)`            |
| `size-4`                     | `width: calc(var(--spacing) * 4)` + `height:` same (usually icons → `var(--px16)`) |
| `h-9` / `w-full` / `min-h-0` | `height: calc(var(--spacing) * 9)` / `width: 100%` / `min-height: 0`               |
| `max-w-sm`                   | `max-width: 24rem` (sm=384px, md=28rem, lg=32rem, xl=36rem)                        |

## Color (never hard-code hex)

| Tailwind                                    | SASS                                                                                      |
| ------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `bg-background` / `bg-card` / `bg-popover`  | `background: var(--background)` / `var(--card)` / `var(--popover)`                        |
| `bg-primary`, `text-primary-foreground`     | `background: var(--primary)`, `color: var(--primary-foreground)`                          |
| `bg-secondary` / `bg-muted` / `bg-accent`   | `var(--secondary)` / `var(--muted)` / `var(--accent)` (foregrounds: `-foreground` suffix) |
| `bg-destructive`                            | `var(--destructive)`                                                                      |
| `text-foreground` / `text-muted-foreground` | `color: var(--foreground)` / `var(--muted-foreground)`                                    |
| `border-border` / `border-input`            | `border-color: var(--border)` / `var(--input)`                                            |
| `ring-ring` / focus rings                   | `outline: 2px solid var(--ring)` + `outline-offset: 2px` (or box-shadow ring)             |
| `bg-black/50`, `bg-primary/90`              | `color-mix(in oklab, var(--primary) 90%, transparent)`                                    |
| `text-destructive`                          | `color: var(--destructive)`                                                               |

## Radius / border / shadow

| Tailwind              | SASS                                                                             |
| --------------------- | -------------------------------------------------------------------------------- |
| `rounded-sm/md/lg/xl` | `border-radius: var(--radius-sm/md/lg/xl)`                                       |
| `rounded-full`        | `border-radius: 9999px`                                                          |
| `border`              | `border: 1px solid var(--border)`                                                |
| `shadow-sm`           | `box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`                                      |
| `shadow-md`           | `box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`   |
| `shadow-lg`           | `box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` |

## Typography

| Tailwind                    | SASS                                                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `text-xs/sm/base/lg/xl`     | `font-size: 0.75rem/0.875rem/1rem/1.125rem/1.25rem` (+ `line-height: 1rem/1.25rem/1.5rem/1.75rem/1.75rem`) |
| `font-medium/semibold/bold` | `font-weight: 500/600/700`                                                                                 |
| `leading-none`              | `line-height: 1`                                                                                           |
| `tracking-tight`            | `letter-spacing: -0.025em`                                                                                 |
| `font-mono`                 | `font-family: var(--font-mono)`                                                                            |

## Layout

`flex` → `display: flex`; `inline-flex` → `display: inline-flex`; `items-center` → `align-items: center`; `justify-between` → `justify-content: space-between`; `flex-col` → `flex-direction: column`; `grid grid-cols-3` → `display: grid` + `grid-template-columns: repeat(3, minmax(0, 1fr))`; `shrink-0` → `flex-shrink: 0`; `grow` → `flex-grow: 1`; `relative/absolute/fixed` → `position:`; `inset-0` → `inset: 0`; `z-50` → `z-index: 50`; `overflow-hidden` → `overflow: hidden`; `hidden` → `display: none`; `pointer-events-none` → `pointer-events: none`.

## State selectors (shadcn data-attributes)

| Tailwind               | SASS                                                 |
| ---------------------- | ---------------------------------------------------- |
| `hover:bg-accent`      | `&:hover`                                            |
| `focus-visible:ring-2` | `&:focus-visible`                                    |
| `disabled:opacity-50`  | `&:disabled, &[data-disabled]`                       |
| `data-[state=open]:…`  | `&[data-state="open"]`                               |
| `data-[highlighted]:…` | `&[data-highlighted]`                                |
| `aria-invalid:…`       | `&[aria-invalid="true"]`                             |
| `[&>svg]:size-4`       | `> svg` child rule                                   |
| `dark:…`               | skip (light theme default) or scoped `.theme-dark &` |

## Opacity / cursor / misc

`opacity-50` → `opacity: 0.5`; `cursor-pointer` → `cursor: pointer`; `select-none` → `user-select: none`; `whitespace-nowrap` → `white-space: nowrap`; `truncate` → `overflow: hidden; text-overflow: ellipsis; white-space: nowrap`; `transition-colors` → `transition: color 150ms, background-color 150ms, border-color 150ms`; `outline-none` → `outline: none`.
