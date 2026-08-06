---
title: "Design Boss"
description: "Authoritative Design Boss playbook for UI craft, accessibility, motion, and visual QA."
type: guide
---

# Design Boss

**Activate:** [`/activate-boss-design`](../../../commands/activate-boss-design.md)

Use this authoritative playbook for design systems, UI craft, accessibility, motion,
and visual QA. Read no other boss playbook unless a handoff below requires it. For a
non-trivial delivery, then load the [orchestration runtime](../../../skills/boss-orchestration/SKILL.md).

## Mission and boundaries

Design owns token architecture, component visual language, WCAG 2.2 AA, motion tokens,
and polish loops for Studio app shells, public marketing sites, and package docs. The
monorepo is **Svelte UI first**.

**Out of scope:** product agent harnesses (Agent), personal session pruning (Workflow),
and behavioral E2E as the primary owner (Code). Media/video grammar
([`taste`](../../../skills/taste/SKILL.md)) belongs to Creator, not Design UI craft.

## Stack and surface gate

1. Detect the stack from manifests and file extensions. Default to Svelte; use React,
   Vue, or Flutter reviewers only when that stack is present or being migrated.
2. Identify the surface: Studio app shell, public `sites/*` marketing site, package
   docs, or mobile.
3. Use the SEO path only for public `sites/` surfaces.

## Primary agents

- [A11Y Architect](../../../agents/a11y-architect.md) — WCAG 2.2 AA, focus, ARIA, and
  inclusive UI.
- [Svelte Reviewer](../../../agents/svelte-reviewer.md) — primary UI implementation
  reviewer for monorepo components, runes, SASS, and snippets.
- [SEO Specialist](../../../agents/seo-specialist.md) — semantic HTML, structure, and
  SEO for public sites only.

### Secondary agents

- [React Reviewer](../../../agents/react-reviewer.md) — React/Next only.
- [Vue Reviewer](../../../agents/vue-reviewer.md) — Vue/Nuxt only.
- [Flutter Reviewer](../../../agents/flutter-reviewer.md) — Flutter only.

## Mapped skills

- [Design System](../../../skills/design-system/SKILL.md),
  [Frontend Design Direction](../../../skills/frontend-design-direction/SKILL.md),
  [Frontend Design](../../../skills/frontend-design/SKILL.md), and
  [Web Design Guidelines](../../../skills/web-design-guidelines/SKILL.md) — tokens,
  hierarchy, palette, layout language, and web-craft baseline.
- [Impeccable](../../../skills/impeccable/SKILL.md),
  [Make Interfaces Feel Better](../../../skills/make-interfaces-feel-better/SKILL.md),
  [Better UI](../../../skills/better-ui/SKILL.md),
  [Better Layout](../../../skills/better-layout/SKILL.md),
  [Better Typography](../../../skills/better-typography/SKILL.md), and
  [Better Interface](../../../skills/better-interface/SKILL.md) — Studio and
  micro-interaction polish.
- [Motion Foundations](../../../skills/motion-foundations/SKILL.md),
  [Motion UI](../../../skills/motion-ui/SKILL.md),
  [Motion Advanced](../../../skills/motion-advanced/SKILL.md), and
  [Motion Patterns](../../../skills/motion-patterns/SKILL.md) — motion from
  foundations through advanced interactions.
- [Accessibility](../../../skills/accessibility/SKILL.md) and
  [Frontend A11Y](../../../skills/frontend-a11y/SKILL.md) — WCAG enforcement.
- [Liquid Glass Design](../../../skills/liquid-glass-design/SKILL.md) — depth only
  when the surface calls for it.
- [Brand Discovery](../../../skills/brand-discovery/SKILL.md) and
  [Brand Voice](../../../skills/brand-voice/SKILL.md) — brand-aligned tokens and copy.
- [Browser QA](../../../skills/browser-qa/SKILL.md) — visual, interaction, and layout
  regression QA.
- [Inherit Legacy Style](../../../skills/inherit-legacy-style/SKILL.md),
  [Theme Factory](../../../skills/theme-factory/SKILL.md),
  [Canvas Design](../../../skills/canvas-design/SKILL.md),
  [Algorithmic Art](../../../skills/algorithmic-art/SKILL.md), and
  [Styling Docs Builder](../../../skills/styling-docs-builder/SKILL.md).
- [Frontend Patterns](../../../skills/frontend-patterns/SKILL.md) — an
  agnostic/React-leaning reference; prefer the Svelte contract in this monorepo.

## Mapped commands

- [`/plan-canvas`](../../../commands/plan-canvas.md) — spatial canvas or board planning.
- [`/svelte-review`](../../../commands/svelte-review.md) — primary Svelte UI review.
- [`/quality-gate`](../../../commands/quality-gate.md) — visual and accessibility release checks.
- [`/react-build`](../../../commands/react-build.md),
  [`/react-review`](../../../commands/react-review.md), and
  [`/vue-review`](../../../commands/vue-review.md) — stack-detected secondary paths.

## Playbook

### Phase 0 — stack and surface

Detect the stack and surface, then load the primary reviewers. Do not make a
React/Vue/Flutter path the default in a Svelte surface.

### Phase 1 — tokens and design language

1. Start with Design System, Frontend Design Direction, and Frontend Design.
2. Pull Brand Discovery when brand decisions are still open.
3. Prefer Impeccable for FractalEngine Studio shells.

### Phase 2 — component craft and motion

1. Polish with Make Interfaces Feel Better and the Better UI/Layout/Typography/Interface
   checklists.
2. Apply motion foundations → UI → advanced/patterns only as needed.
3. Use glass or depth only when it strengthens the surface.

### Phase 3 — accessibility, visual QA, and docs

1. Use A11Y Architect with the accessibility skills.
2. Run Browser QA and `/quality-gate` when shipping UI.
3. For public sites, include SEO structural sanity with SEO Specialist.
4. After token work, produce living style maps with Styling Docs Builder.

## Verification defaults

- Inspect token usage and contrast-critical surfaces.
- Run `/quality-gate` for shipped UI.
- For public sites, check semantic/SEO structure.

## Handoffs

- **→ [Svelte](../svelte/INDEX.md):** design decisions are made and routes, runes, or
  SASS components need implementation.
- **→ [Code](../code/INDEX.md):** security, tests, or release checks are needed.
- **→ [Creator](../creator/INDEX.md):** the task expands into a new product scaffold.
