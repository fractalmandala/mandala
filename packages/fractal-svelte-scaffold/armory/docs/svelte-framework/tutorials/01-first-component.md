---
title: "Build your first Button"
description: "A first short-prompt tutorial for building a Svelte 5 component."
type: tutorial
---

# Build your first Button

This tutorial shows the intended user experience: ask for a component in one sentence,
then inspect the files and receipt the agent produces.

## Before you start

Make sure the Fractal Agentic plugin is installed and your SvelteKit project loads its
project mandate. See the main [Getting started guide](../../01-getting-started.md).

## 1. Ask for the component

Give the agent a short request:

```text
Add a reusable Button component with children, primary and secondary variants,
small/medium/large sizes, disabled state, and a click callback.
```

You do not need to paste the long implementation instructions. The builder resolves the
button recipe, Svelte 5 component patterns, styling rules, and accessibility review.

## 2. Inspect the planned files

Expect a plan similar to:

```text
src/lib/components/Button/Button.svelte
src/lib/components/Button/Button.types.ts
src/lib/components/Button/Button.sass
```

The agent should not invent route files for a reusable component.

## 3. Review the result

Check that the component uses:

- `$props` and typed public props;
- a native `<button>` element;
- `onclick`, not legacy `on:click`;
- an external indented `.sass` file when custom styling is needed;
- visible focus and disabled behavior; and
- no component `<style>` block, inline styles, or fallback hex palette.

## 4. Read the receipt

The receipt should tell you the recipe selected, changed files, public API, checks run,
skipped checks, residual risks, and one verdict: `ship`, `fix-first`, or `rethink`.

If the agent says `fix-first`, follow [Troubleshoot fix-first results](../how-to/troubleshoot-fix-first-results.md).

## What you learned

Short prompts are the product surface. The framework's internal routing and review
contract carry the detailed decisions for you.
