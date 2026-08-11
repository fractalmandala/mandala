---
title: "Why skills are conditional"
description: "Understand why the framework activates only the skills relevant to a request."
type: explanation
---

# Why skills are conditional

The armory is broad by design. A project may need Svelte runes, SASS, accessibility,
motion, remote data, Tauri, or deployment—but a single button does not need all of them.

Conditional routing provides three benefits:

1. lower context cost for agents;
2. fewer conflicting generic examples; and
3. a receipt that explains which specialized decisions were active.

Conditional does not mean optional quality. If the request is interactive, accessibility
becomes required. If it uses a route loader, data-flow guidance becomes required. If it
uses a third-party DOM library, the directive and SSR surfaces become required.
