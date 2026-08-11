# AGENTS.md

The mandala monorepo supports various websites, packages and wip apps.

## Public Packages

**fractal-agentic**
An orchestrator prime - charioteer: domain bosses, a single orchestrator, and a vendored armory of skills, agents, and commands.
[![npm version](https://img.shields.io/npm/v/fractal-agentic.svg)](https://www.npmjs.com/package/fractal-agentic)

**morphicons-svelte**
a porting of morphicons to svelte.
[![npm version](https://img.shields.io/npm/v/morphicons-svelte.svg)](https://www.npmjs.com/package/morphicons-svelte)

**svelte-animated-icon** and **@fractaldesign/svelte-icons**
thousands of iconsets animated in dozens of ways. a more than complete animated icons library for sveltekit.
[![npm version](https://img.shields.io/npm/v/svelte-animated-icon.svg)](https://www.npmjs.com/package/svelte-animated-icon)
[![npm version](https://img.shields.io/npm/v/@fractaldesign/svelte-icons.svg)](https://www.npmjs.com/package/@fractaldesign/svelte-icons)

**fractalsvelte**
an ongoing attempt to replicate shadcn-svelte but without tailwind dependencies. also a way to learn bits ui.
[![npm version](https://img.shields.io/npm/v/fractalsvelte.svg)](https://www.npmjs.com/package/fractalsvelte)

## Fractal Agentic

A must try package. The grand orchestration of 167 skills, 59 commands, 33 agents, 7 bosses all under 1 system that learns, grows, maintains a wiki and knows how to complete tasks well.
<a href="https://fractal-agentic.vercel.app/">Take a look!</a>

This is a constantly evolving monorepo. It is best to study any available AGENTS.md files inside the projects - `apps/` , `sites/` and `packages/` to get more information. Some common monorepo features:

1. Sveltekit, Svelte 5, Tauri, and Typescript based stack.
2. Exclusive use of single-tab indented SASS styling (not SCSS, pure old SASS without braces or colons).

## Projects Registry

1. Apps

- Fractalengine - `apps/fractalengine` - new all-in-one app development. Current project.
- Fracta - `apps/fracta` - WIP notes app.
- Fractalknow - `apps/fractalknow` - experimental notes app.

2. Sites

- Fractaldesign - `sites/fractaldesign` - housed at [Fractaldesign](https://www.fractaldesign.in), a design and web dev blog and curation site.
- Fractalmandala - `sites/fractalmandala` - housed at [Fractalmandala](https://www.fractalmandala.in), my own blog and knowledge wiki.
- Fractaldharma - `sites/fractaldharma` - housed at [Fractaldharma](https://www.fractaldharma.in), a Sanskrit text corpus site.
- Fractalmem - `sites/fractalmem` - ongoing experimental work on a site and package for Sanskrit-based agent memory.

3. Packages

- Fractals Styler - `packages/fractals-styler` - a public npm package that scaffolds my prefered SASS styling and preset classes into any new project.
- Svelte Animated Icon - `packages/svelte-animated-icon` - a public npm package for using animated icons inside Sveltekit projects.
- Svelte Icons - `packages/svelte-icons` - combined library for various iconsets (private).
- Fractalsvelte - `packages/fractalsvelte` - WIP Sveltekit component library and its public site front-end.
- OKF Package - `packages/okfpackage` - WIP experiments with Google's open knowledge foundation.
- Acrolls - `packages/acrolls` - vendored SvelteKit publishing and documentation workspace;
  its `@acrolls/*` packages are included in the Mandala workspace.
