---
kind: external_dependency
name: ELK — Graph layout engine
slug: elk-layout-kernel
category: external_dependency
category_hints:
    - vendor_identity
scope:
    - '**'
source_files:
    - packages/fractal-agentic/.repograph/fractal-agentic-schema.html
---

ELK is bundled inline with the Svelte Flow visualization to compute node positions for the 41-node, 56-edge graph. It runs entirely client-side with no network dependency at runtime, enabling the collapsed swim-lane view and drillable flow paths.