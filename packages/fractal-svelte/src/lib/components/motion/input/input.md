# Input Layout Capture

Source component: `input.svelte`

## Diagram 1 — UI architecture and layout flow
```mermaid
graph TD
  input_root["`**input**\n*(full-width flex column)*`"] --> input_label["`**label**\n*(optional; inline padding)*`"]
  input_root --> input_wrap["`**input wrapper**\n*(relative; 2.75rem height; pill border)*`"]
  input_wrap --> input_left["`**left icon**\n*(optional absolute overlay)*`"]
  input_wrap --> input_field["`**input field**\n*(100% width/height; padded)*`"]
  input_wrap --> input_right["`**success/right icon**\n*(conditional absolute overlay)*`"]
  input_root --> input_error["`**error message**\n*(conditional animated block)*`"]
```

## Diagram 2 — DOM and CSS containment
```mermaid
flowchart TD
  subgraph input_dom["input.svelte DOM"]
    direction TB
    input_container["div[data-slot=input]"] --> input_dom_label["optional label"]
    input_container --> input_dom_wrap["div[data-slot=input-wrapper]"]
    input_dom_wrap --> input_dom_left["optional left icon"]
    input_dom_wrap --> input_dom_field["input[data-slot=input-field]"]
    input_dom_wrap --> input_dom_right["success SVG or right icon"]
    input_container --> input_dom_error["conditional motion.p error"]
  end
  subgraph input_css["input.sass boundaries"]
    input_stack["flex column; gap space-1; width 100%"]
    input_relative["relative wrapper; 2.75rem"]
    input_overlay["absolute 1.25rem icons"]
  end
  input_container -.-> input_stack
  input_dom_wrap -.-> input_relative
  input_dom_left -.-> input_overlay
  input_dom_right -.-> input_overlay
```

The root stacks label, control wrapper, and optional error vertically with `space-1`. The wrapper is a relative positioning context for optional left and right adornments; the field fills its 2.75rem height and adjusts inline padding when adornments exist. The error is a conditional below-wrapper region. No grid, sticky, fixed, or scroll region is present.
