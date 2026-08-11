---
title: "Commands and invocation reference"
description: "Invoke the Svelte framework as a short prompt, skill, command, or routed workflow."
type: reference
---

# Commands and invocation reference

## Short prompts

Use natural language for the common path:

```text
Add a button.
Add a dialog with escape-to-close behavior.
Convert this React component to SvelteKit.
Add a server-loaded /settings route.
```

## Explicit entry points

Use the builder when you want a known component or native recipe. Use the React
conversion skill when source code is React or Next.js. Use `/orchestrate` for any
non-trivial repository change.

```text
/activate-boss-svelte
/orchestrate
```

The startup router selects one boss. The delivery runtime owns verification and the
final `ship | fix-first | rethink` review.

## Direct routing smoke test

```sh
python3 skills/agentic-svelte-builder/scripts/resolve-skill-route.py \
	--routing skills/agentic-svelte-builder/references/SKILL_ROUTING.json \
	--prompt "add a button"
```

## When to be explicit

State the route, dependency, or policy when it materially changes the result:

```text
Use the existing Bits UI dependency; do not add a new package.
Convert this Next page to +page.server.ts and keep SSR enabled.
Use native Svelte transitions instead of installing a motion library.
```
