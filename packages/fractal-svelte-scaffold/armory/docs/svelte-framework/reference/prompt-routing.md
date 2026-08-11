---
title: "Prompt routing reference"
description: "Map short requests to the Svelte framework entry skill and supporting capabilities."
type: reference
---

# Prompt routing reference

The machine-readable source is [`SKILL_ROUTING.json`](../../../skills/agentic-svelte-builder/references/SKILL_ROUTING.json).
The executable smoke test is:

```sh
python3 ../../../skills/agentic-svelte-builder/scripts/resolve-skill-route.py \
	--routing ../../../skills/agentic-svelte-builder/references/SKILL_ROUTING.json \
	--prompt "add a button"
```

## Common routes

| Prompt | Route | Entry skill |
| --- | --- | --- |
| “Add a button” | `component-build` | `agentic-svelte-builder` |
| “Add a collapsible accordion” | `component-build` | `agentic-svelte-builder` |
| “Convert this React component” | `react-conversion` | `react-to-sveltekit` |
| “Convert this Next page” | `react-conversion` | `react-to-sveltekit` |
| “Add a SvelteKit form action” | `route-build` | `agentic-svelte-builder` |
| “Convert CSS to SASS” | `style-conversion` | `agentic-svelte-builder` |
| “Add motion” | `motion` | `agentic-svelte-builder` |
| “Preview the styling” | `visual-review` | `agentic-svelte-builder` |
| “Deploy this SvelteKit app” | `deployment` | `agentic-svelte-builder` |

Routing is a starting decision, not a substitute for reading the target workspace. The
agent still inspects package scripts, dependencies, route structure, and project rules.
