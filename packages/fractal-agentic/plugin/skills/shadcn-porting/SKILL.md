---
name: shadcn-porting
description: Convert shadcn / shadcn-svelte components (Tailwind-based) into standalone, Tailwind-free Svelte components styled with pure indented SASS (no semicolons, no braces) on a fractals-styler token system, for the fractals-ui library. Use when the user pastes or points at shadcn component source (button.svelte, card, dialog, etc., Svelte or React) and asks to convert, port, adapt, or add it to the fractals-ui / SASS component library, or to restyle a component away from Tailwind. Also use when updating an already-ported component to match new upstream shadcn code.
---

# shadcn-porting

Convert a Tailwind-based shadcn component into a standalone Svelte 5 component using bits-ui + indented SASS + fractals-styler tokens.

Target library conventions (fractals-ui): Svelte 5 runes, `bits-ui` primitives, `clsx` only (NO tailwind-merge), `lucide-svelte` icons, old indented SASS (`.sass`, no `;` no `{}`), theme via CSS custom properties, JIT utilities via fractals-styler.

## Workflow

1. **Read the source component fully** (all files of the component dir: root .svelte, sub-components, index.ts, any `types.ts` / `tv()` variant file). If React shadcn/ui is given, first map it to the equivalent bits-ui primitives (see references/bits-ui-map.md).
2. **Preserve the API**: same export names in `index.ts`, same prop names and variant/size values. Only styling changes. Keep runes (`$props()`, snippets, `{@render children?.()}`, `bind:`) intact.
3. **Strip Tailwind**: remove every utility class from markup. Translate visual intent (layout, spacing, color, radius, shadow, typography, hover/focus/disabled/`data-[state=…]`) into SASS. Decide placement:
   - Global `cn-*` classes in `src/lib/styles/_components.sass` for shared component styling (fractals-ui convention).
   - Scoped `<style lang="sass">` in the .svelte file for one-off components.
4. **Map classes to tokens**: use the token tables in references/token-mapping.md (e.g. `bg-primary` → `background: var(--primary)`, `rounded-md` → `var(--radius-md)`, `px-4` → `calc(var(--spacing) * 4)`).
5. **Replace `tailwind-variants` (`tv()`)** with plain SASS classes: keep the variant prop, compute `class="cn-button cn-button-variant-{variant} cn-button-size-{size}"` in markup, define `.cn-button-variant-default` etc. in SASS.
6. **Replace `cn()`** with the local clsx-only util (`$lib/utils` `cn` = `clsx` re-export); remove `tailwind-merge`.
7. **bits-ui internals**: Svelte scoping does not reach bits-ui-rendered children — style them via `:global(.cn-x)` blocks or `&[data-state="open"]` attribute selectors on global classes. Reimplement tw-animate-css animations (accordion slide, dialog fade/zoom, popover) as SASS keyframes — see references/sass-patterns.md.
8. **Icons**: `lucide-svelte` imports; size via `width: var(--px16)` etc., never `class="size-4"`.
9. **Verify** — run scripts/verify-port.sh against the library root, or manually:
   - `grep -rEn 'class="[^"]*\b(px-|py-|bg-|text-sm|rounded-md|border-input|size-4)\b' <component dir>` → empty
   - `grep -ri tailwind <component dir>` → empty
   - `npm run check` (svelte-check) → 0 errors; `npm run build` → success
   - Fix the classic SASS traps if hit (references/sass-patterns.md: `min()/max()` interpolation, adjacent compound selectors).
10. **Document**: if the library has a `docs/components/` folder, add/update `<name>.md` with a Usage example matching the ported API, then compile-check the snippet.

## Hard rules

- No Tailwind dependency, no `@apply`, no tailwind config, no `tailwind-merge`/`tailwind-variants`/`tw-animate-css`.
- SASS must be indented syntax: tabs/consistent indent, no semicolons, no braces. Component style tag: `<style lang="sass">`.
- Colors come from tokens (`var(--primary)`, `var(--muted-foreground)`, …) — never hard-code hex in component styles; add missing tokens to `_tokens.sass` instead.
- Spacing uses `calc(var(--spacing) * N)` (0.25rem base) or fractals-styler utilities/`--pxN` vars.
- Component stays standalone: importing its folder must not require anything outside the lib + global tokens stylesheet.

## References

- references/token-mapping.md — Tailwind class → SASS/token cheatsheet; read when translating classes.
- references/sass-patterns.md — indented-SASS traps (min/max/clamp, `:global`, keyframes, data-attribute selectors) with fixes; read before writing SASS.
- references/bits-ui-map.md — shadcn React/Radix → bits-ui primitive mapping; read only when porting from React shadcn/ui.

## Scripts

- scripts/verify-port.sh <libRoot> [componentDir] — greps for tailwind remnants/utility classes, then runs svelte-check; use after every port.
