---
title: "Code Boss"
description: "Authoritative Code Boss playbook for audits, security, tests, performance, and docs from code."
type: guide
---

# Code Boss

**Activate:** [`/activate-boss-code`](../../../commands/activate-boss-code.md)

Use this authoritative playbook for codebase auditing, security, performance, tech
debt, test coverage, architecture health, and documentation generated from code.
Read no other boss playbook unless a handoff below requires it. For a non-trivial
delivery, then load the [orchestration runtime](../../../skills/boss-orchestration/SKILL.md).

## Mission and boundaries

Code owns codebase auditing, security, performance, tech debt, test coverage,
architectural health, and **documentation generated from code**. Documentation is
Phase 4 here; there is no separate Docs Boss.

**Out of scope:** personal workflow pruning (Workflow), ECC skill portfolio work
(Meta), and pure visual craft (Design).

## Stack gate

Detect Svelte, React, Vue, Rust, and Tauri from manifests and file extensions. Use
the primary reviewer for the detected stack, keep other stack reviewers secondary,
and retain Code/Security review for cross-stack discipline.

## Primary agents

- [Code Reviewer](../../../agents/code-reviewer.md)
- [Architect](../../../agents/architect.md) and
  [Code Architect](../../../agents/code-architect.md)
- [Code Explorer](../../../agents/code-explorer.md)
- [Security Reviewer](../../../agents/security-reviewer.md)
- [Performance Optimizer](../../../agents/performance-optimizer.md)
- [Build Error Resolver](../../../agents/build-error-resolver.md)
- [Refactor Cleaner](../../../agents/refactor-cleaner.md)
- [Silent Failure Hunter](../../../agents/silent-failure-hunter.md)
- [Comment Analyzer](../../../agents/comment-analyzer.md) and
  [PR Test Analyzer](../../../agents/pr-test-analyzer.md)
- [Doc Updater](../../../agents/doc-updater.md) — codemaps, READMEs, and guides.

## Mapped skills

- [Codebase Onboarding](../../../skills/codebase-onboarding/SKILL.md) and
  [Repo Scan](../../../skills/repo-scan/SKILL.md).
- [Production Audit](../../../skills/production-audit/SKILL.md) — live systems and
  runtime posture only.
- [Workspace Surface Audit](../../../skills/workspace-surface-audit/SKILL.md) — repo
  configuration, entrypoints, and surfaces.
- [Security Review](../../../skills/security-review/SKILL.md),
  [Security Scan](../../../skills/security-scan/SKILL.md), and
  [Security Bounty Hunter](../../../skills/security-bounty-hunter/SKILL.md).
- [Plankton Code Quality](../../../skills/plankton-code-quality/SKILL.md) and
  [Coding Standards](../../../skills/coding-standards/SKILL.md).
- [TDD Workflow](../../../skills/tdd-workflow/SKILL.md),
  [E2E Testing](../../../skills/e2e-testing/SKILL.md) (behavioral E2E is Code-owned),
  and [AI Regression Testing](../../../skills/ai-regression-testing/SKILL.md).
- [Benchmark](../../../skills/benchmark/SKILL.md),
  [Benchmark Optimization Loop](../../../skills/benchmark-optimization-loop/SKILL.md),
  [Latency Critical Systems](../../../skills/latency-critical-systems/SKILL.md), and
  [Performance Investigator](../../../skills/performance-investigator/SKILL.md).
- [Architecture Decision Records](../../../skills/architecture-decision-records/SKILL.md),
  [ADR Updater](../../../skills/adr-updater/SKILL.md), and
  [ADR Writing](../../../skills/adr-writing/SKILL.md).
- [Error Handling](../../../skills/error-handling/SKILL.md),
  [Verification Loop](../../../skills/verification-loop/SKILL.md), and
  [Gateguard](../../../skills/gateguard/SKILL.md).
- [Database Migrations](../../../skills/database-migrations/SKILL.md),
  [Postgres Patterns](../../../skills/postgres-patterns/SKILL.md), and
  [Redis Patterns](../../../skills/redis-patterns/SKILL.md).
- [App Documenter](../../../skills/app-documenter/SKILL.md),
  [Doc Frontmatter](../../../skills/doc-frontmatter/SKILL.md), and
  [Browser Use](../../../skills/browser-use/SKILL.md).

## Mapped commands

- [`/code-review`](../../../commands/code-review.md)
- [`/security-scan`](../../../commands/security-scan.md)
- [`/test-coverage`](../../../commands/test-coverage.md)
- [`/refactor-clean`](../../../commands/refactor-clean.md)
- [`/quality-gate`](../../../commands/quality-gate.md)
- [`/harness-audit`](../../../commands/harness-audit.md) — repo harness/config, not a
  live-production audit.
- [`/santa-loop`](../../../commands/santa-loop.md) — adversarial review before a
  release-critical ship.

## Playbook

### Phase 1 — exploration and surfaces

1. Map the codebase with Codebase Onboarding and Code Explorer.
2. Keep audit types distinct: Workspace Surface Audit + `/harness-audit` inspect repo
   configuration; Production Audit is only for a running system.

### Phase 2 — deep audit

1. Security: `/security-scan` with Security Reviewer.
2. Quality: Code Reviewer with Silent Failure Hunter.
3. Performance: Performance Optimizer, Performance Investigator, and benchmarks.
4. Interactive bugs: Browser Use.

### Phase 3 — remediation and release

1. Fix via Build Error Resolver and Refactor Cleaner.
2. Add targeted tests through TDD, `/test-coverage`, and behavioral E2E.
3. For release-critical work, use `/santa-loop` then `/quality-gate`.

### Phase 4 — documentation

1. Use Doc Updater for codemaps, READMEs, and guides.
2. Use App Documenter for area docs derived from SvelteKit surfaces.
3. Use ADR skills for material architecture decisions.

## Verification defaults

- Run `/security-scan` for sensitive surfaces.
- Run scoped tests and `/test-coverage` as appropriate.
- Run `/quality-gate` before ship; add `/santa-loop` on release-critical paths.

## Handoffs

- **→ [Design](../design/INDEX.md):** visual or accessibility polish remains.
- **← [Agent](../agent/INDEX.md):** product agent work involves tools, secrets, or
  user data.
- **← [Svelte](../svelte/INDEX.md) or [Creator](../creator/INDEX.md):** a product is
  ready for security, tests, or release checks.
- **→ [Meta](../meta/INDEX.md):** skill portfolio rot or plugin compliance is the task.
