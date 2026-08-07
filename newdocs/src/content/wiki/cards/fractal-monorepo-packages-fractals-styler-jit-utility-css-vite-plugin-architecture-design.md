---
title: Fractals Styler — JIT Utility CSS Vite Plugin — Architecture Design
description: The module is a publishable npm package built with tsup into two entry points: an ESM Vite plugin (src/index.ts, exported as the default) and a Node CLI (src/cli.ts, exposed via package.json.bin). Th…
tags: [packages/fractals_styler]
type: card
module: packages/fractals_styler
path: packages/fractals_styler
created: 2026-08-05
updated: 2026-08-06
---

The module is a publishable npm package built with tsup into two entry points: an ESM Vite plugin (src/index.ts, exported as the default) and a Node CLI (src/cli.ts, exposed via package.json.bin). The plugin follows a three-layer pipeline inside src/: scanner.ts uses fast-glob to read project files and extract class tokens and --pxN variable references into a ScanResult; registry.ts declares the static utility map (STATIC_UTILITIES), dynamic prefix-to-CSS-property mapping (DYNAMIC_PREFIXES), breakpoint definitions (BREAKPOINTS), and the resolveDeclarations resolver; generate.ts consumes the scan result to produce plain CSS, splitting base rules from breakpoint-media queries. The Vite plugin exposes a virtual module virtual:fractals-styler.css (with backslash-0-prefixed resolved id) and hooks configResolved, resolveId, load, and configureServer for dev-time file watching and full-reload invalidation. The CLI's init command copies static SASS partials from the bundled templates/ directory into the user's project, giving them editable ownership of _tokens.sass, _globals.sass, _primitives.sass, _typography.sass, _mixins.sass, and index.sass. Dependency direction is strictly one-way: index -> scanner/generate -> registry, with no reverse imports.
