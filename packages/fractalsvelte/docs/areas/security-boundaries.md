---
id: security-boundaries
title: Security Boundaries Area
type: area
tags: [security, sanitization, boundaries]
relates_to: [ADR-004, ADR-016, ADR-018, ADR-028]
summary: Covers HTML sanitization policies, path validation, and security guard policies.
updated: 2026-07-15
---

## Purpose & boundaries

The Security Boundaries area defines the runtime guards that prevent cross-site scripting (XSS), arbitrary HTML rendering, and path traversal vulnerabilities.

## State & persistence

- **Sanitization Config**: DOMPurify profiles declared in `src/lib/sanitizeHtml.ts`.
- **Validation Config**: File leaf-name rules in `src/lib/pathValidation.ts`.
- **Filesystem Grants**: Native `AuthorizedPaths` holds canonical user-selected roots and persists them in the application-data `authorized-paths.json` file. Renderers cannot add a path directly; `request_directory_access` always requires a native folder-picker selection.

## Extension points

- **Sanitization Profiles**: Define custom elements/attributes mappings for markdown, svg, or inline templates in `sanitizeHtml.ts`.

## Cross-area edges

- **Svelte Renders**: Applied globally to all Svelte `{@html}` expressions (e.g. Markdown responses, Mermaid diagrams) (ADR-028).

## Gotchas

- **Strict html boundary**: All Svelte templates using `{@html}` must route expressions through the allowed list of profiles to prevent security build failures.
- **Access denial is not absence**: Native directory reads return the `FS_ACCESS_DENIED:` marker only when an existing path falls outside selected roots. Callers must offer a grant-and-retry flow rather than reporting that folder as missing.
