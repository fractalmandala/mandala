# Documentation template set

Portable Svelte templates derived from the approved interactive prototype. These files are reviewable source templates only; they are not wired into the three live site routes.

## Templates

Each site has a main-page template and a document-page template:

- `fractalmandala/MandalaHomeTemplate.svelte`
- `fractalmandala/MandalaDocumentTemplate.svelte`
- `fractalagentic/AgenticHomeTemplate.svelte`
- `fractalagentic/AgenticDocumentTemplate.svelte`
- `fractaldesign/DesignHomeTemplate.svelte`
- `fractaldesign/DesignDocumentTemplate.svelte`

## Styles

Import `styles/index.sass` once from the consuming SvelteKit root layout, before the `virtual:fractals-styler.css` import described in `packages/fractals-styler/GUIDE.md`.

The stylesheet follows the CUBE model:

- `_compositions.sass` contains layout primitives such as `l-cluster`, `l-sidebar`, `l-switcher`, and `l-prose`.
- `_utilities.sass` contains reusable utilities such as `u-label`, `u-action`, and `u-visually-hidden`.
- `mandala.sass`, `agentic.sass`, and `design.sass` contain site blocks and responsive exceptions.
- `_tokens.sass` contains shared theme tokens and site accents.

There is no BEM selector naming and no component-level `<style>` block in the Svelte templates.

## Themes

Every template accepts `theme: 'light' | 'dark'` and defaults to light:

```svelte
<MandalaHomeTemplate theme="dark" />
<DesignHomeTemplate theme="light" logoSrc="/images/logotype-black.png" />
```

The templates accept content and navigation props so the markup can be reused with the existing site data when implementation begins.
