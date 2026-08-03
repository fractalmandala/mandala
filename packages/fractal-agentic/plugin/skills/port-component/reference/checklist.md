# Definition of done

A component is not ported until every box is ticked. Run through this before reporting.

## Source

- [ ] Every internal dependency was already ported (not stubbed)
- [ ] The component's examples were read **before** props were designed
- [ ] Oracle output grepped for `:is(.` — every hit is a consumer-class API needing a prop
- [ ] Oracle run with `--style luma`, output used as the source of truth

## Markup — `src/lib/components/<name>/<name>.svelte`

- [ ] No `class` attribute on the component's own elements
- [ ] No `cn()`, `clsx`, `tailwind-merge`, `tailwind-variants` imports
- [ ] No icon-library import
- [ ] `data-slot` on every styled element, names matching the source
- [ ] Every `tv()` variant axis is a typed prop rendered as `data-*`
- [ ] Runes only — no `$:`, no stores, no `export let`
- [ ] `$derived(expr)` not `$derived(() => expr)`
- [ ] `ref = $bindable(null)` + `bind:this`
- [ ] `{...restProps}` last
- [ ] `index.ts` barrel exports Root, aliases, and the variant types

## Styles — `src/lib/components/<name>/<name>.sass`

- [ ] Indented SASS, single tab, no braces, no semicolons
- [ ] No `<style>` block anywhere
- [ ] No hardcoded colours — tokens only
- [ ] No `--tw-*` property copied from oracle output
- [ ] `--spacing` and Tailwind-default radii resolved to real values
- [ ] Mixins used rather than re-declared (`+interactive`, `+focus-ring`, `+icon-child`, …)
- [ ] `+interactive` NOT used on a text-entry control (it kills text selection)
- [ ] Any component-scoped custom property (`--card-spacing`) kept, not inlined
- [ ] Checked whether `_reset.sass` sets the same property on this element type
- [ ] Mixin parameters checked against the oracle (ring opacity, icon size)
- [ ] Shared prop mixins (`+radius-variants` etc.) declared **last**
- [ ] Registered in `src/lib/styles/index.sass`
- [ ] Nothing added to the central files that isn't used by 5+ components

## Docs — `src/content/components/<name>.md`

- [ ] Sections in order: Installation → Usage → Examples → Props → Theming
- [ ] shadcn is never mentioned
- [ ] Examples are one `<Examples>` tabbed area
- [ ] Every prop is in the props table, including `ref` and `children`
- [ ] Theming section lists the tokens the component reads
- [ ] `status` flipped to `"ready"` in `src/lib/docs/registry.ts`

## Ledger — `ports/<name>.json`

- [ ] Every invented prop recorded with its rationale
- [ ] Every deliberate deviation recorded with its risk
- [ ] Examples ported / deferred listed, deferrals name their blocker
- [ ] Any 2–4-use utility promoted to central is noted

## Verification

- [ ] `pnpm check` — 0 errors, 0 warnings
- [ ] `npx sass --load-path=src/lib/styles src/lib/styles/index.sass /tmp/c.css` compiles
- [ ] **Page opened in a browser and looked at** — light _and_ dark
- [ ] Every ported example renders correctly
- [ ] Interactive states exercised: hover, focus-visible ring, disabled, `aria-invalid`
- [ ] Keyboard reachable, focus ring visible

> Compiling is not evidence that it looks right. Every bug found during the pilot ports was
> visual and passed typecheck cleanly: a 24px icon in a 36px button, underlined anchor
> buttons, an unstyled markdown table, a missing preflight. Open the page.
