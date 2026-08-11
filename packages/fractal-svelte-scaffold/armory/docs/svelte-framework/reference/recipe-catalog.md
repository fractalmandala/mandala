---
title: "Recipe catalog"
description: "Understand the native and Svelte recipe packs exposed by the builder."
type: reference
---

# Recipe catalog

The builder's canonical machine-readable catalog is [`MANIFEST.json`](../../../skills/agentic-svelte-builder/references/MANIFEST.json).
The human explanation is [`INDEX.md`](../../../skills/agentic-svelte-builder/references/INDEX.md).

## Current coverage

- 44 native component recipes;
- 24 Svelte 5 recipes; and
- 14 overlapping component names represented in both packs.

These are recipe counts, not unique component counts.

## Routing roots

```text
references/<name>.md          native HTML / CSS recipe
references/svelte/<name>.md   Svelte 5 rune recipe
```

The manifest keeps the compatibility keys `zero_js` and `svelte5`. Use the manifest to
resolve paths; do not assume every component has both variants.

## Choosing a recipe

- Choose native HTML when the request explicitly wants zero JavaScript or the platform
  element already provides the behavior.
- Choose Svelte 5 when the request needs controlled state, dynamic data, or app logic.
- Choose a library recipe only when the target project already uses or approves that
  dependency.

Recipe examples are starting points. The active workspace's Svelte Boss rules and design
tokens still govern the final output.
