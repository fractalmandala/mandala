# Button Layout Capture

Source component: `button.svelte`

## Diagram 1 — UI architecture and layout flow
```mermaid
graph TD
  button_root["`**button**\n*(inline-flex; centered; size variants)*`"] --> button_ripples["`**ripple layer**\n*(conditional absolute inset; clipped)*`"]
  button_root --> button_content["`**button content**\n*(inline-flex; centered; gap space-2)*`"]
  button_content --> button_children["`**children snippet**\n*(slotted content)*`"]
```

## Diagram 2 — DOM and CSS containment
```mermaid
flowchart TD
  subgraph button_dom["button.svelte DOM"]
    direction TB
    button_el["motion.button[data-slot=button]"] --> button_dom_ripple["conditional ripples span"]
    button_dom_ripple --> button_dom_items["each ripple span"]
    button_el --> button_dom_content["span[data-slot=button-content]"]
    button_dom_content --> button_dom_children["rendered children"]
  end
  subgraph button_css["button.sass boundaries"]
    button_layout["inline-flex; center alignment"]
    button_overlay["absolute inset ripple; overflow hidden"]
    button_gap["content inline-flex; gap space-2"]
  end
  button_el -.-> button_layout
  button_dom_ripple -.-> button_overlay
  button_dom_content -.-> button_gap
```

The button is an inline-flex control with centered content. Size variants define 2rem, 2.5rem, or 3rem heights with inline padding; icon size is a 2rem square. The optional ripple layer is an absolute, inset, overflow-hidden decorative region behind the content. No responsive, sticky, fixed, or scroll layout is defined.
