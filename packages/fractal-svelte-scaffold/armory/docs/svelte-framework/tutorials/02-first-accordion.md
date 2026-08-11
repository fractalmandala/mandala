---
title: "Build your first Accordion"
description: "Build an accessible controlled Svelte 5 Accordion from a short request."
type: tutorial
---

# Build your first Accordion

Use this tutorial when you want a stateful component rather than a static markup recipe.

## 1. Ask for an accessible component

```text
Add an accessible collapsible accordion with stable item IDs, one open item at a time,
optional default open state, keyboard navigation, and reduced-motion-friendly animation.
```

The builder selects the Svelte 5 Accordion recipe and activates accessibility review.

## 2. What the implementation should contain

A complete result should include a usable item API, for example:

```ts
type AccordionItem = {
	id: string
	title: string
	content: string
}
```

The trigger should be a native button with `aria-expanded` and `aria-controls`. The
panel should have a stable ID and an `aria-labelledby` relationship.

## 3. Verify behavior

Ask the agent to verify:

- initial open and closed states;
- single-open behavior;
- keyboard activation and arrow navigation;
- focus visibility;
- Svelte compilation in client and server modes; and
- indented SASS compilation.

Static inspection alone is not enough for a stateful component. If no component test
runner is available, the receipt must record that gap.

## 4. Extend it safely

Ask follow-up requests such as:

```text
Add multiple-open mode while preserving the existing API.
```

or:

```text
Add a snippet-based content API without changing the default string-content API.
```

The agent should update its planned files and public API before editing.
