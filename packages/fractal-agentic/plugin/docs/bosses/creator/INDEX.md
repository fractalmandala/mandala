---
title: "Creator Boss"
description: "Authoritative Creator Boss playbook for scaffold-to-ship apps, sites, and packages."
type: guide
---

# Creator Boss

**Activate:** [`/activate-boss-creator`](../../../commands/activate-boss-creator.md)

Use this authoritative playbook for scaffold → build → ship of monorepo apps, sites,
and packages. Creator has executive authority to pull another boss armory. Read no
other boss playbook until a concrete phase needs one. For a non-trivial delivery,
then load the [orchestration runtime](../../../skills/boss-orchestration/SKILL.md).

## Mission and boundaries

Creator owns end-to-end product delivery. Its media/video grammar
([`taste`](../../../skills/taste/SKILL.md)) is a Creator media lane, not Design UI
craft. Pure personal workflow belongs to Workflow; ECC portfolio administration
belongs to Meta unless Creator is creating a new skill.

## Stack and target gate

1. Detect the stack and target before scaffolding. Default monorepo frontend work to
   SvelteKit + Svelte 5 + indented SASS; use Tauri for desktop only when applicable.
2. Use the current repository surface and live indexes rather than a static registry.
   Mark aspirational targets such as `fractalbuilder` and `fractalbodha` as planned.

## Executive cross-domain armory

| Lean on | Pull | Why |
| --- | --- | --- |
| [Design](../design/INDEX.md) | design system, impeccable, a11y, motion | UI craft |
| [Svelte](../svelte/INDEX.md) | runes, data flow, SASS, port component | app body and library ports |
| [Code](../code/INDEX.md) | security, performance, quality gate, santa loop, app documenter | ship readiness and docs |
| [Agent](../agent/INDEX.md) | harness, memclaw, MCP builder, continuous loops | AI features in product |
| [Workflow](../workflow/INDEX.md) | context save/restore, hooks | session continuity |
| [Meta](../meta/INDEX.md) | skill create, promote | skills born during creation |

## Primary agents

- [Architect](../../../agents/architect.md) and
  [Code Architect](../../../agents/code-architect.md)
- [Code Explorer](../../../agents/code-explorer.md)
- [Rust Reviewer](../../../agents/rust-reviewer.md) and
  [Rust Build Resolver](../../../agents/rust-build-resolver.md) — Tauri 2.
- [OpenSource Packager](../../../agents/opensource-packager.md),
  [OpenSource Forker](../../../agents/opensource-forker.md), and
  [OpenSource Sanitizer](../../../agents/opensource-sanitizer.md)
- [Build Error Resolver](../../../agents/build-error-resolver.md)

## Mapped skills

- [Brainstorming](../../../skills/brainstorming/SKILL.md) and
  [Spec Writing](../../../skills/spec-writing/SKILL.md) — pre-blueprint design.
- [Blueprint](../../../skills/blueprint/SKILL.md) and
  [Build Feature End to End](../../../skills/build-feature-end-to-end/SKILL.md).
- [Subagent Driven Development](../../../skills/subagent-driven-development/SKILL.md).
- [Port Component](../../../skills/port-component/SKILL.md) and the shadcn pipeline.
- [Web Artifacts Builder](../../../skills/web-artifacts-builder/SKILL.md).
- [MCP Builder](../../../skills/mcp-builder/SKILL.md) for agent-facing product tools.
- [App Documenter](../../../skills/app-documenter/SKILL.md).
- [Design System](../../../skills/design-system/SKILL.md) and
  [Frontend Patterns](../../../skills/frontend-patterns/SKILL.md).
- [Rust Patterns](../../../skills/rust-patterns/SKILL.md),
  [Rust Testing](../../../skills/rust-testing/SKILL.md),
  [Vite Patterns](../../../skills/vite-patterns/SKILL.md), and
  [Bun Runtime](../../../skills/bun-runtime/SKILL.md).
- [OpenSource Pipeline](../../../skills/opensource-pipeline/SKILL.md).
- [Liquid Glass Design](../../../skills/liquid-glass-design/SKILL.md),
  [Motion Foundations](../../../skills/motion-foundations/SKILL.md), and
  [Architecture Decision Records](../../../skills/architecture-decision-records/SKILL.md).
- [Taste](../../../skills/taste/SKILL.md) — media only.

## Mapped commands

- [`/plan-canvas`](../../../commands/plan-canvas.md)
- [`/project-init`](../../../commands/project-init.md)
- [`/rust-build`](../../../commands/rust-build.md),
  [`/rust-review`](../../../commands/rust-review.md), and
  [`/rust-test`](../../../commands/rust-test.md)
- [`/skill-create`](../../../commands/skill-create.md)
- [`/promote`](../../../commands/promote.md) and [`/pr`](../../../commands/pr.md)
- [`/quality-gate`](../../../commands/quality-gate.md)
- [`/santa-loop`](../../../commands/santa-loop.md) before a major ship.

## Playbook

### Phase 0 — brainstorm, spec, blueprint, scaffold

1. Use Brainstorming → Spec Writing.
2. Use Blueprint with `/project-init`.
3. Align the target with the current repository surface and live inventories.

### Phase 1 — architecture and native gateways

1. Set module boundaries with architect agents.
2. For Tauri, keep a single IPC gateway with `ipc-mock` parity.
3. Use OpenSource Pipeline for package exports and publishing.

### Phase 2 — cross-domain construction

1. Pull Svelte for the app body and port lane.
2. Pull Design for polish.
3. Pull Agent for AI product features.
4. Use Build Feature End to End with SDD for the delivery spine.

### Phase 3 — verify and ship

1. Pull Code for security, performance, and App Documenter.
2. Run Rust tests for Tauri.
3. Run `/santa-loop` + `/quality-gate` with packager/PR work as needed.

## Verification defaults

- Use `/project-init` and Blueprint alignment for new trees.
- Run `/quality-gate` and package/open-source gates when publishing.
- Run `/santa-loop` before a major ship.

## Handoffs

- **→ [Svelte](../svelte/INDEX.md):** scaffold exists and the app body is SvelteKit.
- **→ [Design](../design/INDEX.md):** visual system or polish is needed.
- **→ [Code](../code/INDEX.md):** pre-ship audit and release gates are needed.
- **→ [Agent](../agent/INDEX.md):** the product needs an agent harness or MCP surface.
- **→ [Meta](../meta/INDEX.md):** a new skill moves into portfolio health.
