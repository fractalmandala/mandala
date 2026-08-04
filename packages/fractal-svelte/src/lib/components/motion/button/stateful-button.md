# Stateful Button Layout Capture

Source component: `stateful-button.svelte`

## Diagram 1 — UI architecture and layout flow
```mermaid
graph TD
  stateful_root["`**stateful button**\n*(delegates base dimensions and alignment)*`"] --> stateful_presence["`**state content region**\n*(AnimatePresence; one branch at a time)*`"]
  stateful_presence --> stateful_loading["`**loading branch**\n*(icon + loading text)*`"]
  stateful_presence --> stateful_success["`**success branch**\n*(icon + success text)*`"]
  stateful_presence --> stateful_error["`**error branch**\n*(icon + error text)*`"]
  stateful_presence --> stateful_idle["`**idle branch**\n*(rendered children snippet)*`"]
```

## Diagram 2 — DOM and CSS containment
```mermaid
flowchart TD
  subgraph stateful_dom["stateful-button.svelte DOM"]
    direction TB
    stateful_button["Button component"] --> stateful_anim["AnimatePresence"]
    stateful_anim --> stateful_branch["conditional motion.span"]
    stateful_branch --> stateful_icon["icon span + SVG"]
    stateful_branch --> stateful_label["state text or rendered children"]
  end
  subgraph stateful_css["nested button.svelte boundaries"]
    stateful_base["inline-flex centered button"]
    stateful_content["inline-flex content; gap space-2"]
  end
  stateful_button -.-> stateful_base
  stateful_branch -.-> stateful_content
```

The component has no extra wrapper; it delegates its outer control layout to `button.svelte`. Conditional loading, success, error, and idle branches occupy the same content region, each pairing an optional icon with text or the children snippet. No grid, sticky, fixed, or scroll region is defined.
