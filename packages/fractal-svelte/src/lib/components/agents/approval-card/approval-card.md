# Approval Card Layout Review

## Findings

### Align to shared edges

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM | `approval-card/approval-card.sass:27`, `approval-card/approval-card.sass:59` | Body and result indentation are encoded with physical left margins. | Replace the four-value/physical margins with `margin-block-start` plus `margin-inline-start: 1.75rem`. | The Align to Shared Edges principle requires logical indentation so hierarchy mirrors correctly in RTL. |

### Plan for growth and clipping

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM | `approval-card/approval-card.svelte:159-184`, `approval-card/approval-card.sass:42-53` | Question navigation and approval actions share non-wrapping footer rows with labels such as “Request changes” and localized submit text. | Allow footer actions to wrap with a clear row/column gap; at narrow container widths, stack text actions while preserving question progress before navigation actions. | The Plan for Growth and Clipping principle requires critical approval actions to stay visible and reachable under zoom and string growth. |

## Verification

- Static source check: reviewed `approval-card/approval-card.svelte` and sibling `approval-card/approval-card.sass` for hierarchy, indentation, action ordering, multi-step controls, and localization growth.
- Observed: the body follows the header in source order and interactive/result states remain in normal document flow.
- Not run: rendered viewport checks, browser zoom checks, RTL rendering checks, localization stress checks, multi-step interaction, or cross-browser checks.

## Verdict

Needs changes
