---
id: ADR-034
title: Snippet-Rendered Virtual List Rows
type: adr
tags: [security, virtual-list, bookmarks, search, snippets, sanitization]
summary: Replaces VirtualList's sanitized HTML-string renderItem API with a Svelte snippet prop, restoring the bookmarks row UI the inline sanitizer had stripped and removing the {@html} sink and its inline profile.
relates_to: [ADR-027, ADR-028, src/lib/components/VirtualList.svelte, src/lib/sanitizeHtml.ts]
status: accepted
updated: 2026-07-16
---

# ADR-034: Snippet-Rendered Virtual List Rows

**Status:** Accepted
**Date:** 2026-07-16
**Decision makers:** FractalEngine Studio maintainer

## Context

ADR-028 routed VirtualList's caller-supplied `renderItem` HTML strings through the
`sanitizeHtml.inline` profile (text-level tags only, no attributes). That closed the
`{@html}` hole but silently destroyed the bookmarks module: its rows were authored as
HTML strings full of `div`s, `button`s, classes, `data-id` and `aria-label` attributes,
all of which the profile strips. Bookmarks rendered as bare text runs — no layout, no
classes, and no Edit/Delete buttons at all, which also made the delegated click handler
unreachable. SearchOverlay had been flattened to attribute-free tags to survive the
profile, losing its `.search-result-row` / `.search-hit-highlight` styling hooks. The
Playwright suites caught both but had been left failing.

## Decision

VirtualList's row API becomes a Svelte 5 snippet: `row: Snippet<[unknown, number]>`
replaces `renderItem: (item, index) => string`, and the component renders rows with
`{@render row(item, index)}`. Row content is compiled Svelte markup — interpolated text
is escaped by the framework, event handlers attach directly (no `data-id` delegation),
and no string of markup ever crosses a trust boundary.

Consequently the `{@html}` expression in VirtualList is deleted, its entry is removed
from the html-boundary guard-test allowlist, and the now-unused `sanitizeHtml.inline`
profile is removed. BookmarksLayout and SearchOverlay author their rows as snippets
using token-based classes in `_bookmarks.sass` / `_searchoverlay.sass`, replacing the
former inline `style="…"` strings.

## Consequences

### Positive

- Bookmarks rows render fully again — layout, tags, and working Edit/Delete buttons.
- Search hits regain their semantic classes (`.search-result-row`, `.search-hit-highlight`).
- One fewer `{@html}` sink and one fewer sanitization profile to reason about; the
  boundary is enforced by the compiler instead of a runtime filter.
- Row styling moved from inline style attributes to tokenized SASS (Rule 1/6 compliance).

### Negative

- VirtualList consumers must be Svelte components; rows can no longer be produced by
  plain string-returning functions.

### Neutral

- Keyboard navigation, virtualization math, and the listbox/option roles are unchanged.

## Alternatives Considered

### Widen the `inline` profile to allow structural tags and attributes

Rejected: an allowlist broad enough for real rows (buttons, `aria-*`, classes) no longer
meaningfully constrains injected markup, and every widening would need a security review.

### Keep HTML strings but add a per-caller profile parameter

Rejected: pushes the trust decision back to every caller — the exact dispersal ADR-028
centralized the boundary to avoid.

## Related Decisions

| ADR | Title | Relationship |
|---|---|---|
| ADR-027 | Data Layer — In-Memory Mock Engine & Search Index | depends on |
| ADR-028 | Security Boundaries & Contract-Typed IPC | amends |
