# Tooltip Layout Capture

Source component: `tooltip.svelte`

## Diagram 1 — UI architecture and layout flow
```mermaid
graph TD
  tooltip_trigger["`**tooltip trigger**\n*(inline-flex; anchor region)*`"] --> tooltip_children["`**children snippet**\n*(trigger content)*`"]
  tooltip_trigger -.-> tooltip_anchor["`**tooltip anchor**\n*(conditional fixed overlay; z-index 9999)*`"]
  tooltip_anchor --> tooltip_panel["`**tooltip panel**\n*(nowrap; padding space-1/3; shadow)*`"]
  tooltip_panel --> tooltip_content["`**string or content snippet**\n*(conditional content branch)*`"]
```

## Diagram 2 — DOM and CSS containment
```mermaid
flowchart TD
  subgraph tooltip_dom["tooltip.svelte DOM"]
    direction TB
    tooltip_root["span[data-slot=tooltip-trigger]"] --> tooltip_dom_children["rendered children"]
    tooltip_root --> tooltip_dom_anchor["conditional span[data-slot=tooltip-anchor]"]
    tooltip_dom_anchor --> tooltip_dom_panel["motion.span[data-slot=tooltip]"]
    tooltip_dom_panel --> tooltip_dom_content["string or rendered content"]
  end
  subgraph tooltip_css["tooltip.sass boundaries"]
    tooltip_trigger_css["inline-flex; vertical-align middle"]
    tooltip_fixed["position fixed; pointer-events none; z-index 9999"]
    tooltip_box["block; nowrap; padding space-1/3"]
  end
  tooltip_root -.-> tooltip_trigger_css
  tooltip_dom_anchor -.-> tooltip_fixed
  tooltip_dom_panel -.-> tooltip_box
```

The trigger remains an inline-flex anchor and renders its children in normal flow. When open, the tooltip is placed in a fixed, pointer-events-none overlay positioned from the trigger with an 8px gap; side-specific transforms align it above, below, left, or right. The panel is a nowrap block with padding and shadow. It is the only fixed overlay; no scroll region is defined.
