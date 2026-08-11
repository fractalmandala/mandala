---
id: bookmarks
title: Bookmarks Area
type: area
tags: [bookmarks, state, modules]
relates_to: [ADR-027]
summary: Covers modules/bookmarks/** including bookmarks state and SQLite DB mock bridges.
updated: 2026-07-15
---

## Purpose & boundaries

The Bookmarks area handles link collections, favorites indexing, and tagging within `src/lib/modules/bookmarks/`.

## State & persistence

- **Bookmarks State**: Handled in `state/bookmarks.svelte.ts`.
- **Persistence**: Cached locally and written through SQLite DB wrappers.

## Extension points

- **Contributions**: Custom bookmarking commands declared in `modules/bookmarks/contributions.ts` (ADR-025).

## Cross-area edges

- **Virtual Scroll**: Relies on `VirtualList` layout wrapper for rendering high-density bookmarks lists. Rows are authored as a Svelte snippet (`row` prop) with token-based classes in `_bookmarks.sass` — never as HTML strings (ADR-034).

## Gotchas

- **Parity verification**: Keep in-memory mock engine in sync with database handlers to satisfy contract checks (ADR-027).
