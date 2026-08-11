---
title: "Framework architecture"
description: "Understand how the Svelte scaffolding framework composes recipes, skills, verification, and review."
type: explanation
---

# Framework architecture

The framework has two entry skills and a conditional armory.

```text
user short prompt
    │
    ▼
SKILL_ROUTING.json
    │
    ├── agentic-svelte-builder ── recipe manifest
    └── react-to-sveltekit ────── conversion contract
    │
    ▼
Svelte 5 + component + styling + a11y + route skills
    │
    ▼
actual files → workspace checks → receipt → review verdict
```

The entry skill makes the request discoverable. Supporting skills carry specialized
knowledge without making every agent read the entire armory.

## Three kinds of output

1. Native HTML/CSS recipes for behavior the platform already provides.
2. Svelte 5 components for stateful or controlled UI.
3. SvelteKit route and conversion output for pages, data, actions, SSR, and endpoints.

The framework does not hide architectural decisions. It records them so another agent
can continue the work.
