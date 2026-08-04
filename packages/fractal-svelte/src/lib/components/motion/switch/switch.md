# Switch Layout Capture

Source component: `switch.svelte`

## Diagram 1 — UI architecture and layout flow
```mermaid
graph TD
  switch_root["`**switch root**\n*(inline-flex row; gap space-3)*`"] --> switch_control["`**switch control**\n*(3rem × 1.75rem; pill track)*`"]
  switch_control --> switch_thumb["`**switch thumb**\n*(1.25rem circle; translated when checked)*`"]
  switch_root --> switch_label["`**optional label**\n*(text beside control)*`"]
```

## Diagram 2 — DOM and CSS containment
```mermaid
flowchart TD
  subgraph switch_dom["switch.svelte DOM"]
    direction TB
    switch_span["span[data-slot=switch-root]"] --> switch_btn["button[data-slot=switch]"]
    switch_btn --> switch_dom_thumb["motion span[data-slot=switch-thumb]"]
    switch_span --> switch_dom_label["conditional label"]
  end
  subgraph switch_css["switch.sass boundaries"]
    switch_row["inline-flex; align center; gap space-3"]
    switch_track["3rem × 1.75rem; padding 0.25rem"]
    switch_thumb_css["1.25rem circular thumb"]
  end
  switch_span -.-> switch_row
  switch_btn -.-> switch_track
  switch_dom_thumb -.-> switch_thumb_css
```

The root is an inline-flex horizontal control group. The switch track has fixed 3rem by 1.75rem dimensions and contains a 1.25rem circular thumb that translates horizontally; an optional label follows with `space-3`. No responsive, grid, sticky, fixed, or scroll region is present.
