---
title: "How skill routing works"
description: "Understand the entry, required, conditional, and review layers of the Svelte skill router."
type: explanation
---

# How skill routing works

Routing follows a precedence order:

1. project rules and explicit user requirements;
2. the Svelte Boss contract;
3. the entry skill;
4. required supporting skills; and
5. conditional skills triggered by the request or target workspace.

This prevents a generic skill example from overriding a project-specific rule. It also
keeps context small: a button request does not need deployment or remote-function docs.

## Required versus conditional

Required skills define the minimum reliable output. Conditional skills add capability
only when evidence says they are relevant. A skipped conditional skill belongs in the
receipt with a reason when the decision affects the work.

## Duplicate knowledge

The router treats `svelte-runes` as the compact rune reference and `svelte-5-runes` as
deeper audit material. It uses `sveltekit-data-flow` for route decisions while
architecture and structure supply composition and path references.

## Conflict handling

The active Svelte Boss contract wins. For this repository, external indented SASS and
semantic data attributes take priority over generic examples that use component style
blocks, inline style directives, or fallback hex colors.
