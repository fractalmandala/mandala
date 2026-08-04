# File Diff Layout Review

## Findings

### Align to shared edges

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM | `file-diff/file-diff.sass:22`, `file-diff/file-diff.sass:28`, `file-diff/file-diff.sass:49-50` | Filename alignment, body indentation, and copy-button placement use `text-align: left`, `margin-left`, and `float: right`. | Use `text-align: start`, `margin-inline-start`, and a flex/grid action row or `float: inline-end` where supported with fallback. | The Align to Shared Edges principle requires logical leading/trailing placement; the current physical directions do not mirror in RTL. |

### Hold structure until it breaks

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM | `file-diff/file-diff.sass:38-47` | Every diff row reserves fixed `2.25rem 2.25rem 1rem` gutter columns at every container width. | Add a content-driven container query that compacts or hides redundant line-number gutters at narrow widths while preserving the code column and horizontal scrolling. | The Hold Structure Until It Breaks principle requires component-level adaptation; fixed gutters consume most of a narrow embedded diff before code is shown. |

## Verification

- Static source check: reviewed `file-diff/file-diff.svelte` and sibling `file-diff/file-diff.sass` for header capacity, logical alignment, diff-grid sizing, overflow, and disclosure.
- Observed: the filename can shrink with ellipsis and the diff viewport supports both-axis overflow.
- Not run: rendered narrow/wide container checks, browser zoom checks, RTL rendering checks, long-filename checks, disclosure/copy interaction, or cross-browser checks.

## Verdict

Needs changes
