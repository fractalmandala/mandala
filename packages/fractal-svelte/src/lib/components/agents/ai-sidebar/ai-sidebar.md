# AI Sidebar Layout Review

## Findings

### Align to shared edges

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM | `ai-sidebar/ai-sidebar.sass:14-15` | Hierarchy indentation and trailing clearance use `padding-left` and `padding-right`. | Use `padding-inline-start: calc(...)` and `padding-inline-end: var(...)`. | The Align to Shared Edges principle requires direction-aware hierarchy; physical padding leaves nested resources indented from the wrong edge in RTL. |

### Hint at hidden content

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM | `ai-sidebar/ai-sidebar.svelte:183-192`, `ai-sidebar/ai-sidebar.sass:27-36` | The rename control occupies the row but is fully transparent until hover or focus-within, and it is removed from keyboard tab order. | Keep a persistent low-emphasis affordance for the active/focused row and reveal it on coarse-pointer/touch layouts, or provide a visible row actions disclosure control. | The Hint at Hidden Content principle requires a cue for available actions; hover-only discovery makes rename effectively invisible on touch and to users who do not know the F2 shortcut. |

## Verification

- Static source check: reviewed `ai-sidebar/ai-sidebar.svelte` and sibling `ai-sidebar/ai-sidebar.sass` for tree hierarchy, indentation, label clipping, hidden actions, and adaptive sizing.
- Observed: item labels shrink safely with ellipsis and mobile rows increase in height.
- Not run: rendered viewport checks, browser zoom checks, RTL rendering checks, localization stress checks, coarse-pointer/touch checks, tree interaction, drag layout, or cross-browser checks.

## Verdict

Needs changes
