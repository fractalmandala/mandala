---
id: ADR-020
title: Isolate Built-Artifact Browser Tests
type: adr
tags: [testing, playwright, build, reliability]
summary: Requires Playwright to launch and test its own production preview on a dedicated non-development port.
relates_to: [ADR-019]
status: accepted
updated: 2026-07-13
---

# ADR-020: Isolate Built-Artifact Browser Tests

**Status:** Accepted  
**Date:** 2026-07-13  
**Decision makers:** FractalEngine maintainers

## Context

The Playwright configuration used port 5173 and enabled `reuseExistingServer` outside CI. Port 5173 is also the development server default, so a local E2E run could attach to an HMR server instead of the production preview created by its `webServer.command`. The resulting run did not reliably test the just-built artifact and could observe stale modules or files changing during the run.

Browser regression results must identify one immutable build. Development servers must remain usable independently, and a developer-owned process must not silently change what the suite tests.

## Decision

We will run Playwright against a freshly launched production preview on dedicated port 4173 with server reuse disabled.

The suite builds first, starts `vite preview` on `127.0.0.1:4173`, waits for that exact URL, and owns the server lifecycle. Any port collision fails visibly instead of falling back to an unrelated process.

## Consequences

### Positive

- Every E2E result covers the production artifact built by that run.
- HMR state and mid-edit module invalidation cannot contaminate regression results.
- Local and CI test semantics are identical.

### Negative

- Every E2E invocation pays the build/startup cost even when a matching preview is already running.
- A process already occupying port 4173 must be stopped or moved before tests can run.

### Neutral

- Development remains on port 5173 and can run concurrently because SvelteKit generation directories are already separated by ADR-019.

## Alternatives Considered

### Reuse any server on port 5173

Rejected because process identity and artifact provenance are unknowable; a green result can cover a development graph instead of the production build.

### Reuse a server on a dedicated preview port

Rejected because it still cannot prove the server hosts the artifact produced by the current run.

### Test only in CI

Rejected because local remediation work needs the same trustworthy feedback before changes reach CI.

## Related Decisions

| ADR | Title | Relationship |
|-----|-------|--------------|
| ADR-019 | Separate SvelteKit Development and Production Generation Directories | Enables concurrent development and production-preview testing without generated-output races. |
