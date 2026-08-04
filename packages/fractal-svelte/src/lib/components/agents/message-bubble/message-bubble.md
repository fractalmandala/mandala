# Message Bubble Layout Review

## Findings

### Align to shared edges

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM | `message-bubble/message-bubble.sass:21` | Bubble content uses `text-align: left` for every writing direction. | Use `text-align: start` so text aligns to the logical leading edge. | The Align to Shared Edges principle requires leading/trailing semantics; a physical left edge reverses the intended reading alignment in RTL layouts. |

## Verification

- Static source check: reviewed `message-bubble/message-bubble.svelte` and sibling `message-bubble/message-bubble.sass` for alignment, width constraints, content growth, variants, and direction-dependent properties.
- Observed: bubble placement supports start/end alignment and long content is constrained by `max-width` rather than a fixed width.
- Not run: rendered viewport checks, browser zoom checks, RTL rendering checks, localization stress checks, interaction checks, or cross-browser checks.

## Verdict

Needs changes
