---
kind: external_dependency
name: '@xyflow/svelte — Svelte Flow rendering engine'
slug: xyflow-svelte
category: external_dependency
category_hints:
    - vendor_identity
scope:
    - '**'
source_files:
    - packages/fractal-agentic/.repograph/fractal-agentic-schema.html
---

The Fractal Agentic schema visualization is rendered as a self-contained HTML page built with @xyflow/svelte (Svelte Flow). The build produces a single 1.72 MB bundle with ELK layout and all dependencies inlined for zero-network runtime. This is the fixed renderer used by the repo-diagram skill's contract — data-only input, the renderer handles drawing, lanes, flows, and edge layers.