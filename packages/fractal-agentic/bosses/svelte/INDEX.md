---
title: "Svelte Boss"
description: "Authoritative Svelte Boss playbook for Svelte 5, SvelteKit, indented SASS, and the universal React-to-Svelte conversion lane."
type: guide
---

# Svelte Boss

**Activate:** [`/activate-boss-svelte`](../../../commands/activate-boss-svelte.md)

Use this authoritative playbook for the monorepo frontend contract: Svelte 5 runes,
SvelteKit data flow, indented SASS, component library work, and the universal React →
Svelte 5 conversion lane. Read no other boss playbook unless a handoff below requires
it. For a non-trivial delivery, then load the
[orchestration runtime](../../../skills/boss-orchestration/SKILL.md).

## Mission and boundaries

Svelte owns the frontend contract for apps, sites, and `packages/fractalsvelte`.

**Out of scope:** pure token brand systems without implementation (Design) and ECC
meta tooling (Meta).

## Stack gate

The monorepo default is Svelte 5 + SvelteKit + indented SASS. React and Vue reviewers
are migration-only secondary reviewers, not peer defaults.

## Primary agents

- [Svelte Reviewer](../../../agents/svelte-reviewer.md) — primary.
- [Code Reviewer](../../../agents/code-reviewer.md) — TypeScript and general discipline.
- [Build Error Resolver](../../../agents/build-error-resolver.md).
- [A11Y Architect](../../../agents/a11y-architect.md) — secondary shared with Design.

### Secondary agents

- [React Reviewer](../../../agents/react-reviewer.md) and
  [Vue Reviewer](../../../agents/vue-reviewer.md) — migration reviews only.

## Mapped skills — core contract

- [Agentic Svelte Builder](../../../skills/agentic-svelte-builder/SKILL.md) — zero-token-waste progressive discovery router for Svelte 5 and HTML/CSS CUBE component construction.
- [Svelte 5 Runes](../../../skills/svelte-5-runes/SKILL.md) — canonical runes authority.
- [Svelte Runes](../../../skills/svelte-runes/SKILL.md) — progressive-disclosure reference pack.
- [Svelte Components Patterns](../../../skills/svelte-components-patterns/SKILL.md),
  [Svelte Components](../../../skills/svelte-components/SKILL.md), and
  [Svelte Template Directives](../../../skills/svelte-template-directives/SKILL.md)
  — components, library patterns, `@attach`, `{@html}`, and `{@render}`.
- [Svelte Styling Patterns](../../../skills/svelte-styling-patterns/SKILL.md) and
  [Svelte Styling](../../../skills/svelte-styling/SKILL.md) — indented SASS.
- [SvelteKit Architecture](../../../skills/sveltekit-architecture/SKILL.md),
  [SvelteKit Data Flow](../../../skills/sveltekit-data-flow/SKILL.md),
  [SvelteKit Remote Functions](../../../skills/sveltekit-remote-functions/SKILL.md),
  [SvelteKit Structure](../../../skills/sveltekit-structure/SKILL.md), and
  [Svelte Deployment](../../../skills/svelte-deployment/SKILL.md).
- [Ecosystem Guide](../../../skills/ecosystem-guide/SKILL.md) — Bits UI and ecosystem
  decisions.
- [Design System](../../../skills/design-system/SKILL.md),
  [E2E Testing](../../../skills/e2e-testing/SKILL.md), and
  [TDD Workflow](../../../skills/tdd-workflow/SKILL.md).

## Universal Port & Conversion Lane

- [React to SvelteKit](../../../skills/react-to-sveltekit/SKILL.md) — universal 4-tier React/Next.js (`.tsx` + `.ts`) → Svelte 5 + SvelteKit (`.svelte` + `.ts` + `.sass`) conversion engine with Framer Motion, GSAP, WebGL canvas, and Svelte 5 Runes mapping.
- [Port Component](../../../skills/port-component/SKILL.md) — primary shadcn-svelte /
  Tailwind → fractalsvelte pipeline.
- [Shadcn Porting](../../../skills/shadcn-porting/SKILL.md) and
  [Shadcn to Svelte](../../../skills/shadcn-to-svelte/SKILL.md) — source conversion.
- [Styling Docs Builder](../../../skills/styling-docs-builder/SKILL.md) — package style maps.

## Mapped commands

- [`/svelte-review`](../../../commands/svelte-review.md) →
  [`/svelte-build`](../../../commands/svelte-build.md) →
  [`/svelte-test`](../../../commands/svelte-test.md) →
  [`/quality-gate`](../../../commands/quality-gate.md).
- [`/code-review`](../../../commands/code-review.md).
- The port command surface is the [React to SvelteKit](../../../skills/react-to-sveltekit/SKILL.md) or [Port Component](../../../skills/port-component/SKILL.md) skill invocation.

## Playbook

### Phase 1 — runes and data flow

1. Start with canonical Svelte 5 Runes; consult Svelte Runes only when needed.
2. Apply SvelteKit Data Flow, Architecture, Structure, and Remote Functions as needed.

### Phase 2 — components, snippets, and SASS

1. Use [Agentic Svelte Builder](../../../skills/agentic-svelte-builder/SKILL.md) for zero-token component pattern discovery, snippets, and CUBE CSS styling.
2. Use component patterns, snippets, and template directives.
3. Use Svelte Styling Patterns and Svelte Styling for indented SASS.
4. Use Ecosystem Guide for Bits UI and ecosystem choices.

### Phase 3 — universal port and library conversion

1. Use [React to SvelteKit](../../../skills/react-to-sveltekit/SKILL.md) as the primary 4-tier conversion pipeline for any React/Next.js component.
2. Use Port Component for shadcn-svelte / Tailwind → fractalsvelte library ports.
3. Use Styling Docs Builder for library style maps.

### Phase 4 — review, check, and E2E

1. Use `/svelte-review` with Svelte Reviewer; bring A11Y Architect for UI.
2. Run `/svelte-build` → `/svelte-test` → `/quality-gate` as scope requires.
3. Apply Svelte Deployment gates for adapters and release targets.

## Verification defaults

- Use the `/svelte-review` mindset with `svelte-check` or `/svelte-build`.
- Run `/svelte-test` when behavior changes.
- Run `/quality-gate` before ship.

## Handoffs

- **→ [Design](../design/INDEX.md):** visual polish, tokens, or motion.
- **→ [Code](../code/INDEX.md):** security or ship review.
- **→ [Creator](../creator/INDEX.md):** a new package or app needs a scaffold.
- **→ [Agent](../agent/INDEX.md):** an in-product AI feature needs a harness; return
  here for the UI layer.
