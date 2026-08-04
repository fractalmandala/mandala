# Prompt Input Layout Review

## Findings

### Hold structure until it breaks

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM | `prompt-input/prompt-input.sass:24-28`, `prompt-input/prompt-input.sass:74-81` | The toolbar is a single non-wrapping flex row containing optional actions, arbitrary leading content, a model selector up to `13rem`, and the submit control. | Add a content-driven container query that lets secondary controls wrap or move to a second row before the composer overflows, while keeping submit in stable trailing chrome. | The Hold Structure Until It Breaks principle requires adaptation at the component's actual available width; the current row has no narrow-container fallback. |

### Align to shared edges

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM | `prompt-input/prompt-input.sass:45`, `prompt-input/prompt-input.sass:50-54`, `prompt-input/prompt-input.sass:69` | Submit uses `margin-left: auto`; the menu anchors with `left: 0`; menu labels use `text-align: left`. | Use `margin-inline-start: auto`, `inset-inline-start: 0`, and `text-align: start`. | The Align to Shared Edges principle requires logical leading/trailing properties; physical left alignment breaks the toolbar and menu alignment in RTL. |

## Verification

- Static source check: reviewed `prompt-input/prompt-input.svelte` and sibling `prompt-input/prompt-input.sass` for toolbar capacity, ordering, popover anchoring, text growth, and logical properties.
- Observed: the textarea grows between configured row limits and remains vertically scrollable beyond the maximum.
- Not run: rendered narrow/wide container checks, browser zoom checks, RTL rendering checks, localization stress checks, menu interaction, virtual-keyboard/safe-area checks, or cross-browser checks.

## Verdict

Needs changes
