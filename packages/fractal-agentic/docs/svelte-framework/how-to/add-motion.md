---
title: "Add motion"
description: "Choose native Svelte transitions or the repository motion stack without hiding dependency or SSR costs."
type: how-to
---

# Add motion

First identify the motion engine and target workspace dependency.

## Choose a tier

| Need | Preferred path |
| --- | --- |
| Simple enter/exit | native `svelte/transition` |
| Framer Motion source | `@humanspeak/svelte-motion` only when present or approved |
| GSAP source | preserve GSAP inside `$effect` with context teardown |
| Drag, pan, SVG, or imperative sequence | motion advanced skills |
| Canvas/WebGL | bound element plus browser-only `$effect` and cleanup |

Do not install a motion dependency or mutate `package.json` automatically. Record
installed, required, missing, and fallback dependencies.

## Respect product policy

The motion skills contain engine-level examples, including style APIs. This repository's
Svelte Boss contract still governs output: use external SASS and semantic attributes
unless the target workspace explicitly permits the motion API's style surface.

## Verify

Check reduced motion, hydration flicker, keyed presence, cleanup, and performance. Every
imperative animation needs cancellation or teardown. The receipt should name the motion
tier and any behavior that became partial.
