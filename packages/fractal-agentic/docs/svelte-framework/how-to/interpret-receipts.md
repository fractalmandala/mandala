---
title: "Interpret conversion and build receipts"
description: "Read the framework's artifact manifest, verification evidence, gaps, and verdict."
type: how-to
---

# Interpret receipts

A receipt is the agent's explanation of what it changed and what it actually verified.

## Read in this order

1. `status`: planned, complete, partial, or blocked.
2. source and target: exact input and output files.
3. public API: props, bindings, callbacks, and snippets.
4. data flow and SSR: route file, serialization, browser APIs, and guards.
5. dependencies: present, required, missing, and fallbacks.
6. verification: command, cwd, purpose, status, and evidence.
7. gaps and residual risk.
8. final verdict: `ship`, `fix-first`, or `rethink`.

## Trust evidence, not confidence

“Files created successfully” is not a compiler check. A skipped `pnpm check` is honest
when the fixture has no package scripts; it is not equivalent to a passing workspace
check.

## Human receipt additions

For routed Svelte work, the receipt should also name the entry skill, required skills,
conditional skills activated, and conditional skills skipped with reasons.
