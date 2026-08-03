# Svelte Animated Icon

Svelte Animated Icon is a Svelte 5 animated icon library - tree-shakeable, multi-library, and powered by the native Web Animations API. Created by Fractaldesign.

## Project

- **Github:** This repo at [Github](https://github.com/fractalmandala/svelte-animated-icon).
- **Built with:** SvelteKit 2, Svelte 5, the `@sveltejs/package` packaging tool, and `mdsvex` for these docs.
- **Animation engine:** the browser's Web Animations API. No animation library dependency.
- **Site:** [www.svelte-animated-icon.vercel.app/](https://svelte-animated-icon.vercel.app/).
- **Getting Started:** [Start Here](/docs/01-introduction).

[![npm version](https://img.shields.io/npm/v/svelte-animated-icon.svg)](https://www.npmjs.com/package/svelte-animated-icon)

## How this site is structured

The package and the docs site share a single SvelteKit project:

- `src/lib/` is the **package source** - `AnimatedIcon`, the templates, and the generated icon files.
- `src/routes/` is the **docs site** you're reading. The home route is an interactive explorer; everything under `/docs` is an `.md` file compiled by mdsvex.
- `scripts/generate.js` reads source SVGs and writes the per-icon `.svelte` files.
- `static/svg/` holds the raw Phosphor and Remix source SVGs.

## License

The package's own source code is released under the license declared in `package.json`. The icons are MIT. See [License](/docs/05-license.md)